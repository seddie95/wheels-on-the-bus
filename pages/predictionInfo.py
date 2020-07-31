from datetime import datetime
import pickle

def check_weather(weather):
    switcher={
        "Clear":1, "Clouds":2, "Drizzle":3,
        "Fog":4, "Mist":5, "Rain":6, "Smoke":7, "Snow":8
    }
    return switcher.get(weather,2)


def check_peak_time(hour):
    PeakTimeList = [7, 8, 9, 16, 17, 18, 19]
    if hour in PeakTimeList:
        return 1
    else:
        return 0


def check_school_holiday(month):
    if month in [5, 6, 7, 8, 12, 1]:
        return 1
    else:
        return 0


def check_public_holiday(selecteddate):
    publicDays = ['2020-01-01', '2020-03-17', '2020-04-13', '2020-05-04', '2020-06-01', '2020-08-03', '2020-10-26',
                  '2020-12-25',
                  '2020-12-26', '2021-01-01', '2021-03-17', '2021-04-05', '2021-05-03', '2021-06-07', '2021-08-02',
                  '2021-10-25', '2021-12-25',
                  '2021-12-26']
    if selecteddate in publicDays:
        return 1
    else:
        return 0


def check_weekend(weekday):
    weekend = ['6', '7']
    if weekday in weekend:
        return 1
    else:
        return 0


def check_rain(weather):
    if weather == 'Rain':
        return 1
    else:
        return 0

def getSuffix(direction):
    if (direction == 'Inbound'):
        return "dir2"
    else:
        return "dir1"


def get_predict_info(request):
    # extract information from users
    line = request['line_id'].upper()
    depstop = int(request['departure_stop_id'])
    arrstop = int(request['arrival_stop_id'])
    direction = request['direction']
    temp = request['temp']
    pressure = request['pressure']
    windSpeed = request['wind_speed']
    weather = request['description']
    depTime = datetime.fromtimestamp(request['departure_timestamp'])
    selecteddate = str(depTime.date())
    weekday = int(depTime.weekday())+1
    month = depTime.month
    hour = depTime.hour

    # mapping dictionary
    with open(f'pages/lineStopMapping'+getSuffix(direction)+'.pkl','rb') as read:
            mapping = pickle.load(read)

    publicHoliday = check_public_holiday(selecteddate)
    schoolHoliday = check_school_holiday(month)
    peakTime = check_peak_time(hour)
    isWeekend = check_weekend(weekday)
    isRain = check_rain(weather)
    weather_main = check_weather(weather)

    #input list of the model
    misc = [publicHoliday, schoolHoliday, temp, pressure, windSpeed , weather_main, weekday, month, hour, peakTime, isWeekend, isRain]

    # destination/arrival information
    try:
        destinationIdx = mapping[line][arrstop]
        destStopIDx = [0] * len(mapping[line].keys())
        destStopIDx[destinationIdx] = 1

    except KeyError:
        return "Unavailable"

    # source/departure information
    try:
        sourceIdx = mapping[line][depstop]
        sourceStopIDx = [0] * len(mapping[line].keys())
        sourceStopIDx[sourceIdx] = 1

    except KeyError:
        return "Unavailable"

    inputValues_source = misc +  sourceStopIDx
    inputValues_dest = misc  + destStopIDx

    with open(f'pages/PickelFiles/{line}_{getSuffix(direction)}.pkl', "rb") as read:
        mp = pickle.load(read)

    timeSource = mp.predict([inputValues_source])[0]

    with open(f'pages/PickelFiles/{line}_{getSuffix(direction)}.pkl', "rb") as read:
        mp = pickle.load(read)

    timeDest = mp.predict([inputValues_dest])[0]



    travelTime = timeDest - timeSource
    if travelTime <0:
        travelTime = 0

    return int(round((travelTime) / 60, 0))
