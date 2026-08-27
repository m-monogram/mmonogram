-- Назначение первого администратора на новом проекте Supabase.
--
-- Зачем этот файл. Миграции создают таблицу public.user_roles, но не кладут
-- в неё ни одной строки, а в форме входа (/admin) есть только вход и сброс
-- пароля — регистрации там нет. Поэтому на чистом проекте складывается
-- тупик: пользователь заведён, войти может, но ProtectedRoute показывает
-- ему «ACCESS DENIED», потому что роли у него нет и взяться ей неоткуда.
--
-- Порядок:
--   1. Authentication → Users → Add user (или вход через форму сброса пароля),
--      завести пользователя с рабочей почтой.
--   2. SQL Editor → выполнить этот файл, подставив ту же почту.
--   3. Перезайти в /admin.
--
-- Роли: admin — полный доступ, включая раздел «Пользователи»;
--       editor — всё, кроме управления пользователями;
--       viewer — роль есть в перечислении, но прав на админку не даёт
--       (is_admin_or_editor её не пропускает).

insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where u.email = 'ЗАМЕНИ_НА_СВОЮ_ПОЧТУ'
on conflict (user_id, role) do nothing;

-- Проверка: должна вернуться одна строка с ролью admin.
select u.email, r.role, r.created_at
from public.user_roles r
join auth.users u on u.id = r.user_id
order by r.created_at;
