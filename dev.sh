# Start the backend
python3 backend/backend.py &
# Start the frontend
cd frontend && npm run dev &
# Wait for both processes to finish
wait
# Exit the script
exit 0