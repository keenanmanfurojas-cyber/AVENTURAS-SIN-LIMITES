begin;

do $$
declare
  first_booking public.bookings;
  second_booking public.bookings;
  test_date date := public.costa_rica_today() + 30;
  blocked_date date := public.costa_rica_today() + 31;
  group_date date := public.costa_rica_today() + 32;
  base_payload jsonb;
begin
  base_payload := jsonb_build_object(
    'booking_code', 'ASL-CE-TEST2',
    'tour_slug', 'ciudad-esmeralda-test',
    'tour_name', 'Tour de prueba',
    'selected_date', test_date,
    'timezone', 'America/Costa_Rica',
    'booking_mode', 'private',
    'quantity', 1,
    'buyer', jsonb_build_object(
      'full_name', 'Persona de prueba',
      'email', 'booking-test@example.invalid',
      'phone', '+50600000000'
    ),
    'price_per_person', 1,
    'total_amount', 1,
    'transport_details', '{}'::jsonb,
    'food_details', '{}'::jsonb,
    'arrival_details', '{}'::jsonb,
    'sinpe_account_number', '+50600000000',
    'sinpe_account_holder', 'Prueba',
    'payment_proof_path', 'tests/proof.webp',
    'pending_hold_until', now() + interval '24 hours',
    'participants', jsonb_build_array(jsonb_build_object(
      'position', 1,
      'full_name', 'Participante de prueba',
      'phone', '+50600000000',
      'has_medical_condition', false,
      'medical_details', '',
      'physical_condition', 'Prueba'
    ))
  );

  first_booking := public.create_booking_transaction(base_payload);

  begin
    perform public.create_booking_transaction(
      jsonb_set(base_payload, '{booking_code}', '"ASL-CE-TEST3"')
    );
    raise exception 'TEST_FAILED: active private hold allowed a second request';
  exception
    when raise_exception then
      if sqlerrm <> 'PRIVATE_DATE_UNAVAILABLE' then raise; end if;
  end;

  perform public.transition_booking_status(
    first_booking.id, 'rejected', 'Prueba de liberación', null, null
  );

  second_booking := public.create_booking_transaction(
    jsonb_set(base_payload, '{booking_code}', '"ASL-CE-TEST3"')
  );
  perform public.transition_booking_status(
    second_booking.id, 'approved', null, null, null
  );

  begin
    insert into public.buyers (full_name, email, phone)
    values ('Prueba', 'private-constraint@example.invalid', '+50600000001')
    returning id into second_booking.buyer_id;
    insert into public.bookings (
      booking_code, tour_slug, tour_name, selected_date, booking_mode,
      quantity, buyer_id, price_per_person, total_amount,
      sinpe_account_number, sinpe_account_holder, payment_proof_path, status
    )
    values (
      'ASL-CE-TEST4', 'otro-tour', 'Otro tour', test_date, 'private',
      1, second_booking.buyer_id, 1, 1,
      '+50600000001', 'Prueba', 'tests/other.webp', 'approved'
    );
    raise exception 'TEST_FAILED: partial unique index allowed double approval';
  exception
    when unique_violation then null;
  end;

  insert into public.blocked_dates (date, reason)
  values (blocked_date, 'Bloqueo de prueba');
  begin
    perform public.create_booking_transaction(
      jsonb_set(
        jsonb_set(base_payload, '{booking_code}', '"ASL-CE-TEST5"'),
        '{selected_date}',
        to_jsonb(blocked_date::text)
      )
    );
    raise exception 'TEST_FAILED: blocked date accepted';
  exception
    when raise_exception then
      if sqlerrm <> 'BOOKING_DATE_BLOCKED' then raise; end if;
  end;

  insert into public.tour_dates (
    tour_slug, tour_name, date, capacity, is_active
  )
  values ('group-test', 'Grupo prueba', group_date, 2, true);
end;
$$;

rollback;
