"use client";

import RoomCard from "../../components/RoomCard";
import { useState, useEffect } from "react";

interface Room {
  imageUrl: string;
  status: boolean;
  _id: string;
  name: string;
  description: string;
  price: string;
  type: string;
  gender: string;
  available: boolean;
  image: string;
  amenities?: string[];
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log("Fetching rooms from API..."); // Debug log
        const response = await fetch("http://localhost:5000/api/rooms");
        
        console.log("Response status:", response.status); // Debug log
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response data:", data); // Debug log

        // Handle different response formats
        let roomsData = [];
        
        if (Array.isArray(data)) {
          // Case 1: Direct array response
          roomsData = data;
        } else if (data && Array.isArray(data.data)) {
          // Case 2: { data: [...] } format
          roomsData = data.data;
        } else if (data && Array.isArray(data.rooms)) {
          // Case 3: { rooms: [...] } format
          roomsData = data.rooms;
        } else if (data && Array.isArray(data.result)) {
          // Case 4: { result: [...] } format
          roomsData = data.result;
        } else {
          throw new Error("Unexpected API response format");
        }

        console.log("Extracted rooms data:", roomsData); // Debug log
        setRooms(roomsData);
        
      } catch (err) {
        console.error("Error fetching rooms:", err); // Debug log
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // ... rest of the component remains the same ...
  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Rooms</h1>
        <div className="text-center">Loading rooms...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Rooms</h1>
        <div className="text-center text-red-500">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCard
              key={room._id}
              name={room.name}
              description={room.description}
              price={room.price}
              type={room.type}
              gender={room.gender}
              available={room.status}
              image={room.imageUrl}
            />
          ))
        ) : (
          <div className="col-span-full text-center">
            {error ? "Error loading rooms" : "No rooms available"}
          </div>
        )}
      </div>
    </main>
  );
}