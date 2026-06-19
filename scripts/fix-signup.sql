DROP TRIGGER IF EXISTS on_user_created_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS auto_confirm_new_user;

DROP FUNCTION IF EXISTS public.create_user_via_rpc;

CREATE OR REPLACE FUNCTION public.create_user_via_rpc(
  user_name text,
  user_password text,
  display_name text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions'
AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
  email text;
BEGIN
  email := lower(regexp_replace(user_name, '[^a-z0-9]', '', 'g')) || '-' || floor(extract(epoch from now()))::text || '@meal-mate.app';
  user_id := gen_random_uuid();
  encrypted_pw := crypt(user_password, gen_salt('bf'));

  INSERT INTO auth.users (id,instance_id,email,encrypted_password,email_confirmed_at,confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token) VALUES (user_id,'00000000-0000-0000-0000-000000000000',email,encrypted_pw,now(),now(),'{"provider":"email","providers":["email"]}',jsonb_build_object('display_name',display_name),now(),now(),'','','','');
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  VALUES (user_id,user_id,jsonb_build_object('sub',user_id,'email',email),'email',user_id::text,now(),now(),now());

  RETURN jsonb_build_object('id',user_id::text,'email',email);
END;
$$;
