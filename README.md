# Wheels on the bus

## Introduction to wheels
A website that allows users to select two particular Dublin bus stops and then produce a prediction of how long
the journey will take using  LGBM Artificial  Neural network. This website has been designed to ensure ease of access 
for all users with no need for a sign-in thus protecting users information and ensuring simplicity in use. The "Wheels"
website was designed with mobile and desktop users in mind.


## Background
This Project was conducted as part of the UCD Computer Science masters (conversion) programme as the summer research
practicum. The essence of this practicum was to develop an application that produces accurate dublin bus travel times 
based on historical data provided by RTPI.The project guidelines did not specify how the this was to be achieved thus
allowing free range to us the students to explore a myriad of technologies both front-end and backend.

## Technologies used
The modelling component of the web application was achieved using the LGBM Artificial  Neural network. The backend is 
powered by python and the Django web framework library. The front-end was produced in the most part using vanilla 
javascript aided by jQuery.

## Reasons for two repositories
A second repository was created so that the applictaion could be deployed to heroku. The size of the initial repository even after compression was far too large for the 500mb  heroku slug limit. This resulted in the creation of a second repository that did not include any external files such as tests and data analysis.

## Deployment

Ensure that you have Git Installed on your computer
For Mac and  Windows download Git [here.](https://git-scm.com/downloads)

For Ubuntu
```bash
sudo apt-get install git-core
```

Install the Heroku command Line interface (CLI)
For Mac and  Windows download Heroku CLI [here.](https://devcenter.heroku.com/articles/heroku-cli)

```bash
sudo snap install --classic heroku
```

Create a Heroku account [here.]( https://signup.heroku.com/)

Clone the repository using Git 

```git
git clone https://github.com/seddie95/wheels-on-the-bus.git
```

If using the zip file create a git repository 

```git
git init
```

Add all of the contents to the repository

```git
git add .
```

Commit all of the contents to the repository

```git
git commit -m "Initial commit"
```

Login into your Heroku account using the CLI

```bash
heroku login -i
```
Create A new Heroku app and name it

```bash
heroku create
```
Push the git repository to Heroku
```git
git push Heroku master
```

When The App has been deployed update the database 
```bash
heroku run python manage.py runserver
```
