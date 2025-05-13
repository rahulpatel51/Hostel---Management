"use client";
import { useState, useEffect } from "react";
import { FiCheckCircle, FiX, FiCalendar, FiUser, FiPhone, FiMail, FiBook, FiHome, FiStar, FiAlertCircle } from "react-icons/fi";

interface Room {
  _id: string;
  name: string;
  description: string;
  price: string;
  type: string;
  gender: string;
  status: string; // 'available', 'booked', 'maintenance', 'reserved'
  imageUrl: string;
  amenities?: string[];
}

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  joinDate: string;
  duration: string;
  specialRequests: string;
}

const RoomCard = ({ 
  room,
  onBook
}: {
  room: Room;
  onBook: () => void;
}) => {
  const statusColors = {
    available: "bg-green-100 text-green-800",
    booked: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    reserved: "bg-blue-100 text-blue-800"
  };

  const statusText = {
    available: "Available",
    booked: "Booked",
    maintenance: "Under Maintenance",
    reserved: "Reserved"
  };

  const isAvailable = room.status === 'available';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
      {/* Room Image with Badges */}
      <div className="relative h-56 w-full">
        <img 
          src={room.imageUrl || '/default-room.jpg'} 
          alt={room.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {room.type}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
            room.gender === 'Male' ? 'bg-blue-500' : 
            room.gender === 'Female' ? 'bg-pink-500' : 'bg-purple-500'
          } text-white`}>
            {room.gender}
          </span>
        </div>
      </div>
      
      {/* Room Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
          <p className="text-lg font-bold text-orange-600">₹{room.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
        
        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
                  <FiStar className="mr-1" size={12} />
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Status and Book Button */}
        <div className="mt-auto">
          <div className={`text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit ${statusColors[room.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
            {statusText[room.status as keyof typeof statusText] || room.status}
          </div>
          
          {/* Always visible Book Now button */}
          <button
            onClick={onBook}
            disabled={!isAvailable}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              isAvailable
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiCalendar /> Book Now
          </button>
          {!isAvailable && (
            <p className="text-xs text-gray-500 mt-1 text-center flex items-center justify-center gap-1">
              <FiAlertCircle size={12} />
              {room.status === 'booked' ? 'This room is already booked' : 
               room.status === 'reserved' ? 'This room is reserved' : 
               'Currently not available for booking'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingForm = ({ 
  room, 
  onClose,
  onSubmit,
  formData,
  setFormData
}: {
  room: Room;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-none lg:rounded-xl w-full h-full lg:h-auto lg:max-w-4xl lg:max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Book {room.name}</h2>
            <p className="text-blue-100">{room.type} Room • {room.gender}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-blue-800 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Info Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                <FiUser className="text-blue-600" /> Personal Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Academic Info Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                <FiBook className="text-blue-600" /> Academic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College/University *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <FiHome className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Course</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="B.Com">B.Com</option>
                  <option value="BA">BA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
              <FiCalendar className="text-blue-600" /> Booking Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="12 months">12 Months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-white py-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    joinDate: '',
    duration: '6 months',
    specialRequests: ''
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rooms");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setRooms(data.rooms || data.data || data.result || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowBookingForm(false);
      setShowSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        college: '',
        course: '',
        joinDate: '',
        duration: '6 months',
        specialRequests: ''
      });
    } catch (err) {
      setError('Failed to submit booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Our Hostel Rooms</h1>
            <div className="flex justify-center">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden h-full animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Rooms</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Our Hostel Rooms</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comfortable living spaces with modern amenities for students
          </p>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Rooms Available</h2>
            <p className="text-gray-500">All rooms are currently occupied. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map(room => (
              <RoomCard
                key={room._id}
                room={room}
                onBook={() => {
                  if (room.status === 'available') {
                    setSelectedRoom(room);
                    setShowBookingForm(true);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal (Full Screen on mobile, Centered on desktop) */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <BookingForm
              room={selectedRoom}
              onClose={() => setShowBookingForm(false)}
              onSubmit={handleSubmitBooking}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
              <div className="flex justify-center mb-4">
                <FiCheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Booking Successful!</h2>
              <p className="mt-2 text-green-100">Your room has been reserved</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                We've received your booking request. Our team will contact you within 24 hours to confirm your reservation and discuss next steps.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}