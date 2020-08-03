from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.shortcuts import render, get_object_or_404
from .models import BusStops, BusLocations, Weather, Routes, Traffic
from .predictionInfo import get_predict_info
from .bus_check import bus_check
from django.views.generic import View
import json
import urllib.parse

# Raw SQL Queries
def get_stop_id(latitude, longitude, line_id):
    """Function to return the stop id based on a longitude"""
    data = BusLocations.objects.raw('''
        SELECT line_id,direction,stop_id,stop_name,latitude,longitude, SQRT(
        POW(69.1 * (latitude - %s), 2) +
        POW(69.1 * (%s - longitude) * COS(latitude / 57.3), 2)) AS distance
        FROM bus_locations
        where line_id =%s
        HAVING distance < 1 ORDER BY distance limit 1;
                  ''', [latitude, longitude, line_id])
    return str(data[0].stop_id)


def get_closest_stops(latitude, longitude):
    """Function to return the five closest stops to the users location"""
    stops = BusLocations.objects.raw('''SELECT line_id,direction,stop_id,stop_name,latitude,longitude, SQRT(
        POW(69.1 * (latitude - %s), 2) +
        POW(69.1 * (%s - longitude) * COS(latitude / 57.3), 2)) AS distance
        FROM bus_locations group by stop_id
        HAVING distance < 1 ORDER BY distance limit 10;
                  ''', [latitude, longitude])

    stop_list = []
    for i in range(len(stops)):
        stop_dict = {
            "stop_name": stops[i].stop_name + ", " + str(stops[i].stop_id),
            "stop_id": stops[i].stop_id,
            "coordinates": {"lat": stops[i].latitude, "lng": stops[i].longitude}

        }
        stop_list.append(stop_dict)

    return stop_list


def get_weather(time_stamp):
    """Function to return the weather based on a timestamp"""
    weather = Weather.objects.raw('''with diff as
               (select *, abs(%s - t.time) diff
                 from weather as t
                 )
              select *
               from diff d
               where d.diff = (select min(d1.diff) from diff d1 );
           ''', [time_stamp])
    # pass the weather data into a dictionary

    weather_dict = {
        "temp": weather[0].temp,
        "pressure": weather[0].pressure,
        "wind_speed": weather[0].wind_speed,
        "description": weather[0].description,
    }
    return weather_dict


def get_direction(departure, arrival, line_id):
    data = BusLocations.objects.raw('''
    select sequence,line_id,direction,stop_id,
    stop_name,latitude,longitude,count(*) as magnitude
            from
            (SELECT  * FROM bus_locations
            where stop_id = %s
            and line_id = %s
            union
            SELECT distinct * FROM bus_locations
            where stop_id = %s
            and line_id = %s) as a
            GROUP BY direction
            ORDER BY magnitude DESC
            LIMIT 1; ''', [departure, line_id, arrival, line_id])
    return data[0].direction


def get_all_stops(line_id, direction):
    data = BusLocations.objects.raw('''SELECT * FROM bus_locations
             where line_id =%s 
             and direction =%s
             group by sequence
             order by sequence;
        ''', [line_id, direction])
    return data


def get_series_of_stops(departure, line_id, num_stops, direction):
    """Function to return the weather based on a timestamp"""
    stops = BusLocations.objects.raw('''select bl.line_id,
         bl.stop_id, bl.stop_name
        from (select sequence, line_id, direction, stop_id, stop_name,
                     max(case when stop_id = %s then sequence end) 
                     over (partition by line_id) as the_sequence
              from bus_locations bl
              where line_id = %s and direction =%s order by sequence
             ) bl
        where sequence >= the_sequence and
      sequence <= the_sequence + %s;''', [departure, line_id, direction, num_stops])

    # Return the stops in a list
    stop_list = []
    for k in range(len(stops)):
        stop_list.append(stops[k].stop_name + ", " + str(stops[k].stop_id))

    return stop_list


# Class Based View
class HomeView(View):
    def get(self, request):
        # form = RawRouteForm()
        # context = {'form': form}
        return render(request, "home.html")
        # return render(request, "home.html", context)


class DisplayRoutesView(View):
    def get(self, *args, **kwargs):
        queryset = Routes.objects.all()

        # loop through the query set and append the route names to the list
        route_list = []
        for route in queryset:
            route_dict = {
                "route_id": route.route_id,
                "headsign": route.headsign
            }
            route_list.append(route_dict)

        return JsonResponse(route_list, safe=False)


class StopsOnRoute(View):
    def post(self, request):

        response = json.loads(request.body)

        # Parse the response
        line_id = response['line_id']
        direction = response['direction']

        queryset = get_all_stops(line_id, direction)

        stop_names = list()

        # loop through the query set and append the stop names to the list
        for i in range(len(queryset)):
            stops_dict = {
                "stop_name": queryset[i].stop_name + ", stop " + str(queryset[i].stop_id),
                "stop_id": queryset[i].stop_id,
                "coordinates": {
                    "lat": queryset[i].latitude,
                    "lng": queryset[i].longitude
                }
            }
            stop_names.append(stops_dict)

        return JsonResponse(stop_names, safe=False)


class AutocompleteView(View):
    def get(self, request):
        term = request.GET.get('term')
        queryset = ""

        if request.GET.get('term').isalpha():
            queryset = BusStops.objects.filter(stopname__icontains=term)
        elif request.GET.get('term').isnumeric():
            queryset = BusStops.objects.filter(stopid__contains=term)

        stop_names = list()

        # loop through the query set and append the stop names to the list
        for stop in queryset:
            dropdown_dict = {
                "stop_name": stop.stopname + ", stop " + str(stop.stopid),
                "coordinates": str([stop.latitude, stop.longitude])
            }
            stop_names.append(dropdown_dict)

        return JsonResponse(stop_names, safe=False)


class ClosestStopsView(View):
    def post(self, request):
        # Obtain users location and retrieve closest stops
        response = json.loads(request.body)

        latitude = response['lat']
        longitude = response['lng']

        closest_stops = get_closest_stops(latitude, longitude)

        return JsonResponse(closest_stops, safe=False)


class TrafficView(View):
    def get(self, request, *args, **kwargs):
        queryset = Traffic.objects.all()

        incident_list = []

        for incident in queryset:
            incident_dict = {
                "description": incident.description,
                "start": incident.start,
                "end": incident.end,
                "coordinates": {
                    "lat": incident.latitude,
                    "lng": incident.longitude
                }
            }

            incident_list.append(incident_dict)

        return JsonResponse(incident_list, safe=False)


class PredictionView(View):
    def post(self, request):
        # Obtain the data that has been posted
        response = json.loads(request.body)

        # Parse the response
        timestamp = response[0][0]['departure_timestamp']

        # Obtain  the weather for the timestamp
        weather = get_weather(timestamp)

        # Creat an empty list to hold the prediction dat
        prediction_data = []

        # Loop through the response and pass data to the models
        for i in range(len(response)):
            journeys = response[i]
            journey_inner = []

            for j in range(len(journeys)):

                agency = journeys[j]['agency']
                line_id = journeys[j]['line_id']
                num_stops = journeys[j]['num_stops']
                departure_timestamp = journeys[j]['departure_timestamp']
                departure_name = journeys[j]['departure_name']
                arrival_name = journeys[j]['arrival_name']
                travel_time = ""

                # Obtain travel time if not a dublin bus route
                try:
                    travel_time = journeys[j]['travel_time']

                except KeyError:
                    travel_time = "Unavailable"

                # Create prediction dictionary
                prediction_inner = {
                    "line_id": line_id,
                    "stops": "",
                    "start_name": departure_name,
                    "end_name": arrival_name,
                    "num_stops": num_stops,
                    "travel_time": f"Not Modeled: {travel_time}",
                    "departure_timestamp": departure_timestamp,
                    "weather_description": weather['description'],
                    "temperature": int(round(weather['temp'])),
                }

                # check if pickle file associated with line_id
                if agency == 'Dublin Bus' and bus_check(line_id):

                    departure_latitude = journeys[j]['departure_location']['lat']
                    departure_longitude = journeys[j]['departure_location']['lng']
                    arrival_latitude = journeys[j]['arrival_location']['lat']
                    arrival_longitude = journeys[j]['arrival_location']['lng']

                    # Empty strings to store the stop id's
                    departure_stop_id = ""
                    arrival_stop_id = ""

                    # Obtain the stop id for departure and arrival stops
                    try:
                        departure_stop_id += departure_name.split(', stop')[1]
                    except IndexError:
                        departure_stop_id += get_stop_id(departure_latitude, departure_longitude, line_id)

                    try:
                        arrival_stop_id += arrival_name.split(', stop')[1]
                    except IndexError:
                        arrival_stop_id += get_stop_id(arrival_latitude, arrival_longitude, line_id)

                    # get the direction the bus is travelling
                    direction = get_direction(departure_stop_id, arrival_stop_id, line_id)

                    # Get all the stops along the route
                    stop_list = get_series_of_stops(departure_stop_id, line_id, num_stops, direction)

                    # Add all of the stop name and id's to a the dictionary
                    prediction_inner["stops"] = stop_list

                    # Dictionary for prediction add weather dict
                    route_dict = {
                        **weather,
                        "line_id": line_id,
                        "departure_stop_id": departure_stop_id,
                        "direction": direction,
                        "departure_timestamp": journeys[j]['departure_timestamp'],
                        "arrival_stop_id": arrival_stop_id,
                    }

                    # Pass route dictionary to model
                    prediction = get_predict_info(route_dict)
                    prediction_inner["travel_time"] = prediction

                    # Add the departure stop id
                    prediction_inner["departure_stop_id"] = departure_stop_id.strip()

                    # Add the prediction_inner dictionary to journey_inner list
                    journey_inner.append(prediction_inner)

                else:
                    # if no pickle file pass the basic dictionary
                    journey_inner.append(prediction_inner)

            prediction_data.append(journey_inner)

        return JsonResponse(prediction_data, safe=False)


# Error handling web-pages


def error_404_view(request, exception):
    return render(request, "404.html")


def error_500_view(request):
    return render(request, "500.html")
