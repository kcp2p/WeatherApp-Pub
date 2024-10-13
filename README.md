# First launch

Fill .env, weather_front/.env.local

Normally these are executed automatically, but you can manually invoke it.
`docker compose exec weather-backend python manage.py makemigrations --noinput`
then
`docker compose exec weather-backend python manage.py migrate --noinput`

Enable static file (for django admin)
`docker compose exec weather-backend python manage.py collectstatic --noinput`

Create superuser account
`docker compose exec weather-backend python manage.py createsuperuser`
