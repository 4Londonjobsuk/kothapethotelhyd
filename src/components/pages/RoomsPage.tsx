import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NavPage, RoomItem } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { PreFooterBanner } from '../common/PreFooterBanner';
import { roomsData as fallbackRoomsData } from '../../data/hotelData';
import { hotelService } from '../../services/hotelService';
import { FadeIn, StaggerContainer, StaggerItem, useBodyScrollLock } from '../common/MotionWrapper';
import {
  Bed,
  Wifi,
  Tv,
  AirVent,
  CheckCircle2,
  ConciergeBell,
  X,
  Calendar,
  Users,
  Maximize2,
  Info,
} from 'lucide-react';

interface RoomsPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: (roomName?: string) => void;
  selectedRoom: RoomItem | null;
  onSelectRoom: (room: RoomItem | null) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  onNavigate,
  onOpenEnquiry,
  selectedRoom,
  onSelectRoom,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [rooms, setRooms] = useState<RoomItem[]>(() => fallbackRoomsData);
  const [detailModalRoom, setDetailModalRoom] = useState<RoomItem | null>(selectedRoom);

  useBodyScrollLock(!!detailModalRoom);

  // Load rooms from hotelService (Supabase active inventory with verified fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      try {
        const liveRooms = await hotelService.getRooms();
        if (isMounted && liveRooms && liveRooms.length > 0) {
          setRooms(liveRooms);
        }
      } catch (err) {
        console.info('[RoomsPage] Retaining verified fallback rooms:', err);
      }
    };
    fetchRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selectedRoom prop if it changes
  useEffect(() => {
    if (selectedRoom) {
      setDetailModalRoom(selectedRoom);
    }
  }, [selectedRoom]);

  // Keyboard Escape listener for room detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailModalRoom(null);
        onSelectRoom(null);
      }
    };
    if (detailModalRoom) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailModalRoom, onSelectRoom]);

  const openRoomModal = (room: RoomItem) => {
    setDetailModalRoom(room);
    onSelectRoom(room);
  };

  const closeRoomModal = () => {
    setDetailModalRoom(null);
    onSelectRoom(null);
  };

  return (
    <div id="rooms-page" className="w-full bg-[#FAFAFA]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        page="rooms"
        eyebrow="A Stay Designed Around You"
        title="Rooms & Suites at Lotus Grand"
        subtitle="Spacious. Stylish. Unforgettable."
        scriptText="More Than Just a Stay"
        bgImage="/assets/hotel-assets/rooms/img_10_hyderabad-super-townhouse-lotus-grand-photo-10.jpg"
        onNavigate={onNavigate}
      />

      {/* 2. FIND YOUR PERFECT STAY */}
      <section id="rooms-listing-section" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            OUR ROOMS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
            Find Your Perfect Stay
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A059] mx-auto my-3" />
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            Choose from our well-appointed rooms and suites, designed for your comfort and
            convenience. Whether you're here for business, leisure, or a family getaway, Lotus Grand
            has the perfect room for you.
          </p>
        </FadeIn>

        {/* Room Cards Grid */}
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <StaggerItem key={room.id}>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-stone-200 flex flex-col justify-between h-full group">
                <div>
                  <div className="h-60 relative overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {room.statusNote && (
                      <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[10px] font-medium px-2 py-0.5 rounded">
                        {room.statusNote}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-stone-900 mb-1.5 group-hover:text-[#0D1E3A] transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-stone-600 mb-4 leading-relaxed line-clamp-2">
                      {room.subtitle}
                    </p>

                    <div className="mb-5">
                      <span className="text-xs font-semibold text-[#0D1E3A] tracking-wide">
                        {room.rateLabel}
                      </span>
                    </div>

                    {/* 4 In-Room Specifications matching mockup */}
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-stone-100 text-center">
                      <div className="flex flex-col items-center">
                        <Bed className="w-4 h-4 text-[#C5A059] mb-1" />
                        <span className="text-[10px] text-stone-600 line-clamp-1">{room.specs.bed}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Wifi className="w-4 h-4 text-[#C5A059] mb-1" />
                        <span className="text-[10px] text-stone-600">Free Wifi</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Tv className="w-4 h-4 text-[#C5A059] mb-1" />
                        <span className="text-[10px] text-stone-600">LED TV</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <AirVent className="w-4 h-4 text-[#C5A059] mb-1" />
                        <span className="text-[10px] text-stone-600">AC</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={() => openRoomModal(room)}
                    className="btn-gold-luxury w-full py-2.5 rounded-lg text-xs font-semibold tracking-wider text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 3. VALUE GUARANTEES STRIP (Dark Wine Background from mockup) */}
      <section id="rooms-value-guarantees" className="bg-[#0A1830] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-[#E0C37B] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-serif font-semibold text-amber-100 mb-1">
                  Best Rates Guaranteed
                </h4>
                <p className="text-xs text-slate-300/90 leading-relaxed font-light">
                  Get the best rates and direct assistance when you book directly with our front desk.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-[#E0C37B] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-serif font-semibold text-amber-100 mb-1">
                  No Hidden Charges
                </h4>
                <p className="text-xs text-slate-300/90 leading-relaxed font-light">
                  What you see is what you pay. Transparent, honest pricing with no surprise surcharges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-[#E0C37B] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-serif font-semibold text-amber-100 mb-1">
                  Direct Personal Assistance
                </h4>
                <p className="text-xs text-slate-300/90 leading-relaxed font-light">
                  Our front desk team is here to help you with special requests and a seamless stay.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. IN-ROOM AMENITIES (4 Columns matching mockup) */}
      <section id="rooms-amenities-section" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            IN-ROOM AMENITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
            Thoughtful Amenities for a Comfortable Stay
          </h2>
        </FadeIn>

        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StaggerItem>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-stone-200 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
              <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AirVent className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h4 className="text-base font-serif font-semibold text-stone-900 mb-1">
                Air Conditioning
              </h4>
              <p className="text-xs text-stone-500 font-light">Stay cool and comfortable</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-stone-200 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
              <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wifi className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h4 className="text-base font-serif font-semibold text-stone-900 mb-1">Free Wifi</h4>
              <p className="text-xs text-stone-500 font-light">Stay connected always</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-stone-200 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
              <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Tv className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h4 className="text-base font-serif font-semibold text-stone-900 mb-1">LED TV</h4>
              <p className="text-xs text-stone-500 font-light">Enjoy your favorite shows</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-stone-200 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
              <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ConciergeBell className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h4 className="text-base font-serif font-semibold text-stone-900 mb-1">
                Room Service
              </h4>
              <p className="text-xs text-stone-500 font-light">
                Delicious dining, at your convenience
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* 5. PRE-FOOTER BANNER */}
      <PreFooterBanner
        type="rooms"
        onNavigate={onNavigate}
        onOpenEnquiry={() => onOpenEnquiry(detailModalRoom?.name)}
      />

      {/* ROOM DETAIL MODAL */}
      <AnimatePresence>
        {detailModalRoom && (
          <div
            id="room-details-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeRoomModal}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Content */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header Bar */}
              <div className="bg-[#0A1830] text-white px-6 py-4 flex items-center justify-between shrink-0">
                <h3 className="font-serif text-lg font-medium text-amber-100">
                  {detailModalRoom.name} — Lotus Grand
                </h3>
                <button
                  onClick={closeRoomModal}
                  className="text-stone-300 hover:text-white p-1 rounded transition-colors cursor-pointer active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="h-64 rounded-md overflow-hidden relative">
                  <img
                    src={detailModalRoom.image}
                    alt={detailModalRoom.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider block mb-1">
                    Overview
                  </span>
                  <p className="text-sm text-stone-600 leading-relaxed font-light">
                    {detailModalRoom.description}
                  </p>
                </div>

                {/* Room Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-stone-700">{detailModalRoom.specs.bed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-stone-700">{detailModalRoom.specs.capacity || 'Up to 3 Guests'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-stone-700">{detailModalRoom.specs.size || 'Comfortable Layout'}</span>
                  </div>
                </div>

                {/* Amenities in this room */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                    Included Amenities
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    {detailModalRoom.amenities.map((amenity, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {detailModalRoom.statusNote && (
                  <div className="p-3 bg-amber-50 rounded border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Note:</strong> {detailModalRoom.statusNote}. Rates are provided directly upon inquiry based on your travel dates.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    onClick={closeRoomModal}
                    className="px-4 py-2 border border-stone-300 rounded-lg text-xs text-stone-700 hover:bg-stone-50 active:scale-98 transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const name = detailModalRoom.name;
                      closeRoomModal();
                      onOpenEnquiry(name);
                    }}
                    className="btn-gold-luxury px-5 py-2 rounded-lg text-xs flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#081220]" />
                    <span>Enquire for This Room</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
