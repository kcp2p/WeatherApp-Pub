# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: krchuaip <krittin@42bangkok.com>           +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/09/20 01:45:03 by krchuaip          #+#    #+#              #
#    Updated: 2024/09/20 01:48:01 by krchuaip         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

venv:
	python -m venv env

db:
	docker compose up -d

db-down:
	docker compose down

nuke-db:
	docker compose down
	docker volume rm weatherapp_postgres_prod_data

install:
	pip install -r requirements.txt

migrate:
	python weather_app/manage.py makemigrations
	python weather_app/manage.py migrate

runserver:
	python weather_app/manage.py runserver

# Targets
.PHONY: install migrate runserver

.DEFAULT_GOAL := runserver
