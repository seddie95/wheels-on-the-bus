from django.db import models


class Routes(models.Model):
    route_id = models.CharField(primary_key=True, max_length=5)
    headsign = models.CharField(max_length=80, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'routes'


class BusStops(models.Model):
    stopid = models.IntegerField(primary_key=True)
    stopname = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bus_stops'


class Weather(models.Model):
    time = models.IntegerField(blank=True, null=True)
    temp = models.FloatField(blank=True, null=True)
    temp_min = models.FloatField(blank=True, null=True)
    temp_max = models.FloatField(blank=True, null=True)
    real_feel = models.FloatField(blank=True, null=True)
    pressure = models.FloatField(blank=True, null=True)
    wind_speed = models.FloatField(blank=True, null=True)
    description = models.CharField(max_length=45, blank=True, null=True)
    dt_iso = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'weather'


class BusLocations(models.Model):
    sequence = models.IntegerField(blank=True, null=True)
    line_id = models.CharField(primary_key=True, max_length=5)
    direction = models.CharField(max_length=10, blank=True, null=True)
    stop_id = models.IntegerField(blank=True, null=True)
    stop_name = models.IntegerField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bus_locations'


class Traffic(models.Model):
    traffic_id = models.IntegerField(primary_key=True)
    description = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    start = models.TextField(blank=True, null=True)
    end = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'traffic'
