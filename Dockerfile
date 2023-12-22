FROM python:3.10.3-slim-buster

ENV PORT 8000
ENV HOST 0.0.0.0

EXPOSE 8000

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT ["flask", "run"]