#include <Arduino.h>
#include <SPI.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <time.h>
#include <stdlib.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <string.h>

using namespace std;

#define LED 2
#define DHTPIN 2
#define DHTTYPE DHT11

DHT_Unified dht(DHTPIN, DHTTYPE);

uint32_t delayMS;

char ssid[] = "HTLGuest";      // your network SSID (name)
char pass[] = "5BHIF012345";   // your network password
int keyIndex = 0;                 // your network key Index number (needed only for WEP)

int status = WL_IDLE_STATUS;

WiFiServer server(80);
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);
    pinMode(LED, OUTPUT);      // set the LED pin mode

    delay(10);

    // We start by connecting to a WiFi network

    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected.");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    
    server.begin();

    client.setServer("172.31.35.10", 1883);
    if(client.connect("sorgermTest", "schueler", "ib1sdai"))
    {
      Serial.println("Connected with Klio");
    }
    else{
      Serial.println("Not connected with Klio");
    }
}

void LEDPage() {
   WiFiClient client = server.available();   // listen for incoming clients

  dht.begin();

  if (client) {                             // if you get a client,
    Serial.println("New Client.");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println();

            // the content of the HTTP response follows the header:
            client.print("Click <a href=\"/H\">here</a> to turn the LED on pin 5 on.<br>");
            client.print("Click <a href=\"/L\">here</a> to turn the LED on pin 5 off.<br>");

            // The HTTP response ends with another blank line:
            client.println();
            // break out of the while loop:
            break;
          } else {    // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }

        // Check to see if the client request was "GET /H" or "GET /L":
        if (currentLine.startsWith("GET /H")) {
          digitalWrite(LED, HIGH);               // GET /H turns the LED on
        }
        if (currentLine.startsWith("GET /L")) {
          digitalWrite(LED, LOW);                // GET /L turns the LED off
        }
      }
    }
    // close the connection:
    client.stop();
    Serial.println("Client Disconnected.");
  }
}

void getTemperature() {
   delay(delayMS);   
   // Abrufen des Temperaturereignisses und Ausgabe
   // seines Wertes.
   sensors_event_t event;
   dht.temperature().getEvent(&event);
   string dataJson = "{";
   if (isnan(event.temperature)) {
    Serial.println(F("Fehler beim Ablesen der Temperatur!"));
  }   
  else {
    Serial.print(F("Temperatur: "));
    float temperature = event.temperature;
    dataJson.append("\"temperature\": ");
    dataJson.append(to_string(temperature));
    dataJson.append(", ");
    Serial.print(temperature);
    Serial.println(F("°C"));
  }
  // Abrufen des Feuchtigkeitsereignisses und Ausgabe
  // seines Wertes.
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    Serial.println(F("Fehler beim Ablesen der Luftfeuchtigkeit!"));
  }
  else {
    Serial.print(F("Luftfeuchtigkeit: "));
    float humidity = event.relative_humidity;
    dataJson.append("\"humidity\": ");
    dataJson.append(to_string(humidity));
    Serial.print(humidity);
    Serial.println(F("%"));
  }
  dataJson.append("}");
  Serial.println(dataJson.c_str());
  client.publish("htl-villach/noahArsic/temp_sensor", dataJson.c_str());
}

void sendRandomNumber() {
  srand(time(NULL));
  double range = 10.0;
  double div = RAND_MAX / range;
  double random = 10 + (rand() / div);
  char randomStr[100] = "";
  char serialStr[100] = "";
  sprintf(randomStr, "%f", random);
  sprintf(serialStr, "Random number: %s", randomStr);
  Serial.println(serialStr);
  client.publish("htl-villach/noahArsic/test", randomStr);
  Serial.println("Noch eine Runde!");
}

void loop() {
  //LEDPage();
  //sendRandomNumber();
  delay(2000);
  getTemperature();
}