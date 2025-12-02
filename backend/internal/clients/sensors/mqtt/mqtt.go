package mqtt_sensors

import (
	"fmt"
	"log"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type SensorPayload struct {
	Topic   string
	Payload []byte
}

type Client struct {
	client mqtt.Client
}

func NewClient(
	brokerAddr string,
	port int,
	clientId string,
) *Client {
	opts := mqtt.NewClientOptions()

	broker := fmt.Sprintf("tcp://%s:%d", brokerAddr, port)
	opts.AddBroker(broker)
	opts.SetClientID(clientId)
	opts.OnConnect = func(c mqtt.Client) {
		log.Println("connected to brocker")
	}
	opts.OnConnectionLost = func(c mqtt.Client, err error) {
		log.Println("Connection lost:", err)
	}

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	return &Client{client: client}
}

func (c *Client) Subscribe(topic string, ch chan<- SensorPayload) error {
	op := "mqtt.subscribe"

	callback := func(client mqtt.Client, msq mqtt.Message) {
		ch <- SensorPayload{
			Topic:   topic,
			Payload: msq.Payload(),
		}
	}

	token := c.client.Subscribe(topic, 1, callback)
	if token.Error() != nil {
		return fmt.Errorf("%s:%w", op, token.Error())
	}

	token.Wait()
	return nil
}

func (c *Client) Publish(topic string, payload []byte) error {
	op := "mqtt.publish"

	token := c.client.Publish(topic, 1, false, payload)
	token.Wait()
	if token.Error() != nil {
		return fmt.Errorf("%s:%w", op, token.Error())
	}

	return nil
}
