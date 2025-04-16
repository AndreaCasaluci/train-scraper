
# Train Scraper
Train Scraper is a NestJS-based application that periodically scrapes train ticket data from the Trenitalia API and sends customized notifications to users about available trains based on their preferences. The application allows users to define dates, train categories, and other configurations through environment variables.

## Purpose
As an out-of-town college student, I face the same challenge as many others during the holiday season, whether it's Christmas or Easter. It's like being a lion chasing a gazelle—I'm constantly refreshing the Trenitalia website, trying to be faster than the other students in order to snag tickets at a reasonable price before they’re sold out. It becomes a race, checking every 30 minutes to secure my journey home to my family, knowing that if I don’t act quickly, someone else will beat me to it.


## Features

- **Automated Train Scraping:** Runs a scheduled job to check for available trains based on predefined dates and filters.
- **Configurable Settings:** Dates, train categories, email recipients, and other settings are configurable via environment variables.
- **Email Notifications:** Sends emails to notify users about available train tickets, including details like departure/arrival times, prices, CO₂ emissions, and service details.
- **HTML Email Templates:** Uses structured and styled HTML templates for clear and informative email notifications.

## Technologies Used
- **NestJS:** Framework for creating a modular and scalable server-side application.
- **Nodemailer:** Library for sending emails.
- **@nestjs/schedule:** For scheduling jobs.
- **Trenitalia API:** For fetching train data.
- **TypeScript:** For static typing and advanced development tools.
## Installation

- Copy the repository:

```bash
  git clone https://github.com/AndreaCasaluci/train-scraper
  cd train-scraper
```
- Install dependencies:

```bash
  npm install
```
- Set up environment variables: Copy .env.example to .env and configure it with the necessary credentials and settings.

```bash
  cp .env.example .env
```
- Run the application:

```bash
  npm run start
```


## Configuration
The following environment variables should be set in the .env file to configure the application:

- Dates to Check: `DATES_TO_CHECK` — A comma-separated list of dates (in YYYY-MM-DD format) for which to check train availability.
- Train Categories: `TRAIN_CATEGORIES` — A comma-separated list of train categories to filter by (e.g., Frecciarossa, Intercity).
- Denominations: `DENOMINATIONS` — A comma-separated list of train denominations to filter by.
- Email Recipients: `EMAIL_RECIPIENTS` — A comma-separated list of email addresses to notify.
- Email User: `EMAIL_USER` — Email address to send notifications from.
- Email Password: `EMAIL_PASS` — Password for the email account.
- Departure Location ID: `DEPARTURE_LOCATION_ID` - Trenitalia Location ID (Planning on writing a dictionary to translate those)
- Arrival Location ID: `ARRIVAL_LOCATION_ID` - Trenitalia Location ID (Planning on writing a dictionary to translate those)

Example `.env` configuration:
```bash
  DATES_TO_CHECK=2024-11-15,2024-11-16
  TRAIN_CATEGORIES=Frecciarossa,Intercity
  DENOMINATIONS=Premium,Business
  EMAIL_RECIPIENTS=user1@example.com,user2@example.com
  EMAIL_USER=trainscraper@gmail.com
  EMAIL_PASS=yourpassword
  DEPARTURE_LOCATION_ID=830000219
  ARRIVAL_LOCATION_ID=830011145
```
## Usage

1. **Run the Job Service:** The `TrainJobService` is scheduled to run at a defined interval. By default, it uses `CronExpression.EVERY_2_HOURS` for demonstration purposes. Adjust this in `handleTrainJob` as needed.

2. **Email Notifications:** Each time the job runs, it checks for available trains matching the criteria and sends emails to the recipients defined in `EMAIL_RECIPIENTS`.


## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License.

