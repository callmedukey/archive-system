"use client";

import { addDays, setHours, setMinutes, subDays } from "date-fns";
import { useState } from "react";

import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { CalendarEvent } from "@/components/event-calendar/types";

// Sample events data with hardcoded times
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "연간 계획",
    description: "내년을 위한 전략 계획",
    start: subDays(new Date(), 24), // 오늘로부터 24일 전
    end: subDays(new Date(), 23), // 오늘로부터 23일 전
    allDay: true,
    color: "sky",
    location: "주 회의실",
  },
  {
    id: "2",
    title: "프로젝트 마감",
    description: "최종 결과물 제출",
    start: setMinutes(setHours(subDays(new Date(), 9), 13), 0), // 오후 1시, 9일 전
    end: setMinutes(setHours(subDays(new Date(), 9), 15), 30), // 오후 3시 30분, 9일 전
    color: "amber",
    location: "사무실",
  },
  {
    id: "3",
    title: "분기별 예산 검토",
    description: "내년을 위한 전략 계획",
    start: subDays(new Date(), 13), // 오늘로부터 13일 전
    end: subDays(new Date(), 13), // 오늘로부터 13일 전
    allDay: true,
    color: "orange",
    location: "주 회의실",
  },
  {
    id: "4",
    title: "팀 회의",
    description: "주간 팀 동기화",
    start: setMinutes(setHours(new Date(), 10), 0), // 오늘 오전 10시
    end: setMinutes(setHours(new Date(), 11), 0), // 오늘 오전 11시
    color: "sky",
    location: "회의실 A",
  },
  {
    id: "5",
    title: "회식",
    description: "새 프로젝트 요구사항 논의",
    start: setMinutes(setHours(addDays(new Date(), 1), 12), 0), // 오후 12시, 1일 후
    end: setMinutes(setHours(addDays(new Date(), 1), 13), 15), // 오후 1시 15분, 1일 후
    color: "emerald",
    location: "시내 카페",
  },
  {
    id: "6",
    title: "월간보고서 제출",
    description: "보고서 제출",
    start: addDays(new Date(), 3), // 3일 후
    end: addDays(new Date(), 6), // 6일 후
    allDay: true,
    color: "violet",
  },
  {
    id: "7",
    title: "영업 회의",
    description: "논의",
    start: setMinutes(setHours(addDays(new Date(), 4), 14), 30), // 오후 2시 30분, 4일 후
    end: setMinutes(setHours(addDays(new Date(), 5), 14), 45), // 오후 2시 45분, 5일 후
    color: "rose",
    location: "시내 카페",
  },
  {
    id: "8",
    title: "팀 회의",
    description: "주간 팀 동기화",
    start: setMinutes(setHours(addDays(new Date(), 5), 9), 0), // 오전 9시, 5일 후
    end: setMinutes(setHours(addDays(new Date(), 5), 10), 30), // 오전 10시 30분, 5일 후
    color: "orange",
    location: "회의실 A",
  },
  {
    id: "9",
    title: "계약서 검토",
    description: "주간 팀 동기화",
    start: setMinutes(setHours(addDays(new Date(), 5), 14), 0), // 오후 2시, 5일 후
    end: setMinutes(setHours(addDays(new Date(), 5), 15), 30), // 오후 3시 30분, 5일 후
    color: "sky",
    location: "회의실 A",
  },
  {
    id: "10",
    title: "팀 회의",
    description: "주간 팀 동기화",
    start: setMinutes(setHours(addDays(new Date(), 5), 9), 45), // 오전 9시 45분, 5일 후
    end: setMinutes(setHours(addDays(new Date(), 5), 11), 0), // 오전 11시, 5일 후
    color: "amber",
    location: "회의실 A",
  },
  {
    id: "11",
    title: "마을 어르신 교육",
    description: "교육 참석",
    start: setMinutes(setHours(addDays(new Date(), 9), 10), 0), // 오전 10시, 9일 후
    end: setMinutes(setHours(addDays(new Date(), 9), 15), 30), // 오후 3시 30분, 9일 후
    color: "emerald",
    location: "마을 회의실",
  },
];

export default function ScheduleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
    />
  );
}
