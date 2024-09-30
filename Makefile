# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: krchuaip <krittin@42bangkok.com>           +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/09/20 01:45:03 by krchuaip          #+#    #+#              #
#    Updated: 2024/09/30 23:42:04 by krchuaip         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

#!make
include .env
export $(shell sed 's/=.*//' .env)

venv:
	python -m venv env

db:
	docker compose up -d

db-down:
	docker compose down

nuke-db:
	python weather_app/manage.py flush
	python weather_app/manage.py sqlflush | python weather_app/manage.py dbshell
	docker compose down
	docker volume rm weatherapp_postgres_prod_data
	docker compose up -d

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
