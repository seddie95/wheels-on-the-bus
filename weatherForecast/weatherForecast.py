import requests
from weather_api import weather_url
import mysql.connector
from mysql.connector import Error
import sys
import config as c


def get_weather_forecast():
    # Obtain the weather api url
    try:
        url = weather_url

        # use request to call the api and parse the json response
        response = requests.get(url)
        data = response.json()


    except:
        print("Error: connection failed!")
        sys.exit()

    try:
        tableName = "weather"

        # connection to database
        connection = mysql.connector.connect(host=c.host,
                                             database=c.db_name,
                                             user=c.user,
                                             password=c.password,
                                             auth_plugin='mysql_native_password')

        # if successfully connected
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("""truncate  bus_data.weather""")

            # create variables to store the json information
            data_list = data['list']

            # loop through the object to retrieve the necessary weather data and place them into individual lists
            for i in range(len(data_list)):
                times = data_list[i]['dt']
                temp = data_list[i]['main']['temp']
                temp_min = data_list[i]['main']['temp_min']
                temp_max = data_list[i]['main']['temp_max']
                pressure = data_list[i]['main']['pressure']
                real_feel = data_list[i]['main']['feels_like']
                wind_speed = data_list[i]['wind']['speed']
                description = data_list[i]['weather'][0]['main']
                dt_iso = data_list[i]['dt_txt']

                # Create SQL query to insert the data into the table
                insertTable = ("""INSERT INTO """ + tableName + """(time,temp,temp_min,temp_max,
                 real_feel,pressure, wind_speed,description,dt_iso)
                                values(%s,%s,%s,%s,%s,%s,%s,'%s','%s')""" %
                               (times, temp, temp_min, temp_max, real_feel, pressure, wind_speed, description, dt_iso))

                try:
                    # execute SQL query
                    cursor = connection.cursor()
                    cursor.execute(insertTable)
                    connection.commit()
                except Error as e:
                    print(e)
                    pass

        if (connection.is_connected()):
            cursor.close()
            connection.close()

    # exception if connection failed
    except Error as e:
        print("Error while connecting to MySQL", e)
        print("Aborted")


if __name__ == '__main__':
    get_weather_forecast()
