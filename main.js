let data = (function(Vue) {
  new Vue({
    el: "#app",
    data: {
      contacts: [],
      dates: [],
      temps: [],
      mapdata: [],
      allmap: [],
      city: null,
      weather: "",
      img: "",
      description: "",
      tmax: "",
      tmin: "",
      humidity: "",
      temp: "",
      cityname: "",
      pressure: "",
      loading: false,
      errored: false,
      citychart: "",
      chart: null,
      lat: "",
      lon: "",
      citymap: ""
    },
    methods: {
      getData() {
        if (this.city) {
          axios
            .get("https://api.openweathermap.org/data/2.5/weather", {
              params: {
                q: this.city + ",TW",
                units: "Metric",
                appid: "a904553d0b3d14276c4c58e48d8dc71f"
              }
            })
            .then(res => {
              this.contacts = res.data;
              this.weather = this.contacts.weather[0].main;
              this.img = this.contacts.weather[0].icon;
              this.description = this.contacts.weather[0].description;
              this.temp = this.contacts.main.temp;
              this.tmax = this.contacts.main.temp_max;
              this.tmin = this.contacts.main.temp_min;
              this.humidity = this.contacts.main.humidity;
              this.cityname = this.contacts.name;
              this.pressure = this.contacts.main.pressure;
            })
            .catch(error => {
              this.errored = true;
            });
        }
      },
      getChart() {
        this.loading = true;
        if (this.chart != null) {
          this.chart.destroy();
        }

        axios
          .get("https://api.openweathermap.org/data/2.5/forecast", {
            params: {
              q: this.citychart,
              units: "Metric",
              appid: "a904553d0b3d14276c4c58e48d8dc71f"
            }
          })
          .then(response => {
            this.dates = response.data.list.map(list => {
              return list.dt_txt;
            });

            this.temps = response.data.list.map(list => {
              return list.main.temp;
            });

            var ctx = document.getElementById("weatherChart");
            this.chart = new Chart(ctx, {
              type: "line",
              data: {
                labels: this.dates,
                datasets: [
                  {
                    label: "Avg. T",
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgb(75, 192, 192)",
                    fill: false,
                    data: this.temps
                  }
                ]
              },
              options: {
                title: {
                  display: true,
                  text: this.citychart.toUpperCase() + " 5 Day Temperature",
                  fontSize: 15
                },
                tooltips: {
                  callbacks: {
                    label: function(tooltipItem, data) {
                      var label =
                        data.datasets[tooltipItem.datasetIndex].label || "";

                      if (label) {
                        label += ": ";
                      }

                      label += Math.floor(tooltipItem.yLabel);
                      return label + "°C";
                    }
                  }
                },
                scales: {
                  xAxes: [
                    {
                      type: "time",
                      time: {
                        unit: "day",
                        tooltipFormat: "MMM. DD / hA"
                      }
                    }
                  ],
                  yAxes: [
                    {
                      ticks: {
                        callback: function(value, index, values) {
                          return value + "°C";
                        }
                      }
                    }
                  ]
                }
              }
            });
          })
          .catch(error => {
            this.errored = true;
          })
          .finally(() => ((this.loading = false), (this.citychart = "")));
      }
    },
    mounted() {
      var map = L.map("map").setView([23.7819543, 120.769244], 7.25);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
        foo: "bar",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      let new_event_marker;
      map.on("click", function(e) {
        axios
          .get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
              lat: e.latlng.lat,
              lon: e.latlng.lng,
              units: "Metric",
              appid: "a904553d0b3d14276c4c58e48d8dc71f"
            }
          })
          .then(res => {
            if (typeof new_event_marker === "undefined") {
              new_event_marker = new L.marker(e.latlng, {
                draggable: true
              })
                .addTo(map)
                .bindTooltip(res.data.name + " " + res.data.main.temp + "°C")
                .openTooltip();
            } else {
              new_event_marker
                .setLatLng(e.latlng)
                .addTo(map)
                .bindTooltip(res.data.name + " " + res.data.main.temp + "°C")
                .openTooltip();
            }
          });
      });
      let vm = this;
      let new_get_marker;
      $(".getmap").on("click", function() {
        map.setView([23.7819543, 120.769244], 7.25);
        axios
          .get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
              q: vm.citymap + ",TW",
              units: "Metric",
              appid: "a904553d0b3d14276c4c58e48d8dc71f"
            }
          })
          .then(res => {
            this.allmap = res.data;
            if (typeof new_get_marker === "undefined") {
              new_get_marker = L.marker(
                [this.allmap.coord.lat, this.allmap.coord.lon],
                7.25
              )
                .addTo(map)
                .bindTooltip(
                  this.allmap.name + " " + this.allmap.main.temp + "°C"
                );
            } else {
              new_get_marker
                .setLatLng([this.allmap.coord.lat, this.allmap.coord.lon])
                .addTo(map)
                .bindTooltip(
                  this.allmap.name + " " + this.allmap.main.temp + "°C"
                );
            }
          })
          .catch(error => {
            this.errored = true;
          });
      });
      $(".locationtmap").on("click", function() {
        map
          .locate({
            setView: true,
            maxZoom: 13
          })
          .on("locationfound", e => {
            axios
              .get("https://api.openweathermap.org/data/2.5/weather", {
                params: {
                  lat: e.latitude,
                  lon: e.longitude,
                  units: "Metric",
                  appid: "a904553d0b3d14276c4c58e48d8dc71f"
                }
              })
              .then(res => {
                this.mapdata = res.data;
                L.marker([e.latitude, e.longitude])
                  .addTo(map)
                  .bindTooltip(
                    this.mapdata.name + " " + this.mapdata.main.temp + "°C"
                  )
                  .openTooltip();
              })
              .catch(error => {
                this.errored = true;
              });
          });
      });
      map.on("locationfound", onLocationFound);
      function onLocationFound(e) {
        L.marker(e.latlng).addTo(map);
      }
    }
  });
})(Vue);
