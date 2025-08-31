#!/bin/bash

function stop_servers() {
    echo "Arrêt des serveurs..."
    
    # Arrêter le backend
    pid=$(lsof -t -i:5000)
    if [ ! -z "$pid" ]; then
        echo "Arrêt du processus $pid"
        kill $pid
    fi

    # Arrêter le frontend
    pid=$(lsof -t -i:5173)
    if [ ! -z "$pid" ]; then
        echo "Arrêt du processus $pid"
        kill $pid
    fi

    echo "Serveurs arrêtés"
}

function start_servers() {
    echo "Démarrage des serveurs..."
    
    # Démarrer le backend Django
    cd backend
    source venv/bin/activate
    python manage.py runserver 5000 &
    cd ..

    # Démarrer le frontend
    cd frontend
    npm run dev &
    cd ..

    echo "Serveurs démarrés"
    echo "Backend: http://localhost:5000"
    echo "Frontend: http://localhost:5173 ou http://localhost:5174"
}

case "$1" in
    "start")
        start_servers
        ;;
    "stop")
        stop_servers
        ;;
    "restart")
        stop_servers
        start_servers
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac
