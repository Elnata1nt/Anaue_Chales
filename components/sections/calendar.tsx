"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, Check, X } from "lucide-react"

// Dados mock de disponibilidade (em produção, viria de uma API)
const mockAvailability: Record<string, string> = {
  "2024-01-15": "available",
  "2024-01-16": "available",
  "2024-01-17": "booked",
  "2024-01-18": "booked",
  "2024-01-19": "available",
  "2024-01-20": "available",
  "2024-01-21": "available",
  "2024-01-22": "available",
  "2024-01-23": "booked",
  "2024-01-24": "booked",
  "2024-01-25": "available",
  "2024-01-26": "available",
  "2024-01-27": "available",
  "2024-01-28": "available",
  "2024-01-29": "available",
  "2024-01-30": "booked",
}


export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<string[]>([])

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Dias vazios do início do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getDateStatus = (dateStr: string) => {
    return mockAvailability[dateStr] || "available"
  }

  const isDateSelected = (dateStr: string) => {
    return selectedDates.includes(dateStr)
  }

  const handleDateClick = (day: number) => {
    if (!day) return

    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    const status = getDateStatus(dateStr)

    if (status === "booked") return

    if (isDateSelected(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr))
    } else {
      setSelectedDates([...selectedDates, dateStr])
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleReservation = () => {
    if (selectedDates.length === 0) return

    const dates = selectedDates.sort().join(", ")
    const message = `Olá! Gostaria de fazer uma reserva para as seguintes datas: ${dates}`
    const whatsappUrl = `https://wa.me/559294197052?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const days = getDaysInMonth(currentDate)

  return (
    <section id="calendario" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">📅 Disponibilidade</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Verifique Nossa Disponibilidade</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Selecione as datas desejadas e faça sua reserva diretamente pelo WhatsApp
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <Card className="bg-gradient-to-br from-moss-50 to-beige-50 border-moss-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("prev")}
                    className="hover:bg-moss-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-moss-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("next")}
                    className="hover:bg-moss-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-moss-600 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="p-2"></div>
                    }

                    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const status = getDateStatus(dateStr)
                    const isSelected = isDateSelected(dateStr)
                    const isToday =
                      new Date().toDateString() ===
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateClick(day)}
                        disabled={status === "booked"}
                        className={`
                          p-2 text-sm rounded-lg transition-all duration-200 relative
                          ${status === "available" && !isSelected ? "bg-white hover:bg-moss-100 text-moss-800 border border-moss-200" : ""}
                          ${status === "available" && isSelected ? "bg-moss-600 text-white" : ""}
                          ${status === "booked" ? "bg-red-100 text-red-400 cursor-not-allowed" : ""}
                          ${isToday ? "ring-2 ring-moss-400" : ""}
                        `}
                      >
                        {day}
                        {status === "available" && isSelected && (
                          <Check className="h-3 w-3 absolute top-0 right-0 text-white" />
                        )}
                        {status === "booked" && <X className="h-3 w-3 absolute top-0 right-0 text-red-400" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Legend and Reservation */}
            <div className="space-y-6">
              {/* Legend */}
              <Card className="bg-white border-moss-200">
                <CardHeader>
                  <CardTitle className="text-moss-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Legenda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white border border-moss-200 rounded"></div>
                    <span className="text-moss-700">Disponível</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-moss-600 rounded"></div>
                    <span className="text-moss-700">Selecionado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded relative">
                      <X className="h-3 w-3 absolute top-0 right-0 text-red-400" />
                    </div>
                    <span className="text-moss-700">Ocupado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white border-2 border-moss-400 rounded"></div>
                    <span className="text-moss-700">Hoje</span>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Dates */}
              {selectedDates.length > 0 && (
                <Card className="bg-gradient-to-r from-moss-100 to-beige-100 border-moss-200">
                  <CardHeader>
                    <CardTitle className="text-moss-900">Datas Selecionadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {selectedDates.sort().map((date) => (
                        <div key={date} className="flex items-center justify-between bg-white/60 p-2 rounded">
                          <span className="text-moss-800">
                            {new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDates(selectedDates.filter((d) => d !== date))}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleReservation} className="w-full bg-moss-600 hover:bg-moss-700 text-white">
                      Reservar via WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white border-moss-200">
                <CardHeader>
                  <CardTitle className="text-moss-900">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-moss-300 text-moss-700 hover:bg-moss-50 bg-transparent"
                    onClick={() => setSelectedDates([])}
                  >
                    Limpar Seleção
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-moss-300 text-moss-700 hover:bg-moss-50 bg-transparent"
                    asChild
                  >
                    <a
                      href="https://wa.me/559294197052?text=Olá! Gostaria de verificar a disponibilidade para outras datas."
                      target="_blank"
                      rel="noreferrer"
                    >
                      Consultar Outras Datas
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
