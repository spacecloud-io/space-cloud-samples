package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

var greeting string = "hello"

func main() {
	// Load the greeting from the environment variable
	g := os.Getenv("GREETING")
	if g != "" {
		greeting = g
	}
	// Set up the routes
	r := mux.NewRouter()
	r.HandleFunc("/greeting/{name}", greetingHandler)

	// Start the server
	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal("Error while starting server:", err)
	}
}

func greetingHandler(w http.ResponseWriter, r *http.Request) {
	// Get the name to greet
	vars := mux.Vars(r)
	name := vars["name"]

	// Write response to client
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"greeting": fmt.Sprintf("%s %s", greeting, name)})
}
