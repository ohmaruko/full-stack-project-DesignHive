# COMP4170 Full-Stack Web Development Project

## The tasks completed by each team member in the project
- Login Page: Madoka
- Feed Page: Cindy
- New Post Page: Crystal
- Account Page: Angela

## The instructions on how to run the application locally 
### Setting up database in pgadmin:
- Create a database called "DesignHive"
- Set the user to "postgres".
- Set the password of the "DesignHive" database to "1234"
- Run the following SQL command to create the users table:
```
CREATE TABLE users (
user_id SERIAL primary key,
user_name TEXT,
password TEXT,
personal_emoji TEXT,
bio TEXT
)
```
- Import the "users.csv" file to the "users" table.
- Ensure that Options > Header is enabled during import.
- Run the following SQL command to create the posts table:
```
CREATE TABLE posts (
    post_id SERIAL primary key,
    content TEXT,
    user_id INT
)
```
- Import the "posts.csv" file to the "posts" table.
- Ensure that Options > Header is enabled during import.

### Setting up the app in VsCode:
- npm install
- Run the application with node index.js