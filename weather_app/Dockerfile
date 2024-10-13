FROM python:3.12-alpine
ENV PYTHONUNBUFFERED=1

RUN mkdir /workspace
WORKDIR /workspace

COPY . .
RUN apk add --no-cache --virtual .build-deps \
    ca-certificates gcc g++ postgresql-dev linux-headers musl-dev \
    libffi-dev jpeg-dev zlib-dev \
    && pip install -r requirements.txt

ENTRYPOINT ["/workspace/entrypoint.sh"]
