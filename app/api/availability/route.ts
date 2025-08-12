import { NextResponse } from "next/server"

// Interface para eventos do iCal
interface CalendarEvent {
  start: Date
  end: Date
  summary: string
}

// Função para parsear dados iCal básicos
function parseICalData(icalData: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const lines = icalData.split("\n")

  let currentEvent: Partial<CalendarEvent> = {}
  let inEvent = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === "BEGIN:VEVENT") {
      inEvent = true
      currentEvent = {}
    } else if (trimmedLine === "END:VEVENT" && inEvent) {
      if (currentEvent.start && currentEvent.end) {
        events.push(currentEvent as CalendarEvent)
      }
      inEvent = false
    } else if (inEvent) {
      if (trimmedLine.startsWith("DTSTART")) {
        const dateStr = trimmedLine.split(":")[1]
        currentEvent.start = parseICalDate(dateStr)
      } else if (trimmedLine.startsWith("DTEND")) {
        const dateStr = trimmedLine.split(":")[1]
        currentEvent.end = parseICalDate(dateStr)
      } else if (trimmedLine.startsWith("SUMMARY")) {
        currentEvent.summary = trimmedLine.split(":")[1] || "Reserva"
      }
    }
  }

  return events
}

// Função para parsear datas do formato iCal
function parseICalDate(dateStr: string): Date {
  // Remove timezone info se presente
  const cleanDateStr = dateStr.replace(/[TZ]/g, "").substring(0, 8)

  // Formato: YYYYMMDD
  const year = Number.parseInt(cleanDateStr.substring(0, 4))
  const month = Number.parseInt(cleanDateStr.substring(4, 6)) - 1 // Mês é 0-indexado
  const day = Number.parseInt(cleanDateStr.substring(6, 8))

  return new Date(year, month, day)
}

// Função para gerar todas as datas entre duas datas
function getDatesBetween(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const currentDate = new Date(startDate)

  // Ajustar para não incluir o último dia (checkout)
  const adjustedEndDate = new Date(endDate)
  adjustedEndDate.setDate(adjustedEndDate.getDate() - 1)

  while (currentDate <= adjustedEndDate) {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const day = String(currentDate.getDate()).padStart(2, "0")
    dates.push(`${year}-${month}-${day}`)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

export async function GET() {
  try {
    const icalUrl = "https://www.airbnb.com.br/calendar/ical/1457198661856129067.ics?s=64254c8251f4f54cf8b4c3ae58363ea5"

    // Buscar dados do iCal
    const response = await fetch(icalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Calendar-Sync/1.0)",
      },
      next: { revalidate: 3600 }, // Cache por 1 hora
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar iCal: ${response.status}`)
    }

    const icalData = await response.text()

    // Parsear eventos
    const events = parseICalData(icalData)

    // Converter eventos em datas ocupadas
    const bookedDates: Record<string, string> = {}

    events.forEach((event) => {
      const dates = getDatesBetween(event.start, event.end)
      dates.forEach((date) => {
        bookedDates[date] = "booked"
      })
    })

    return NextResponse.json({
      success: true,
      availability: bookedDates,
      lastUpdated: new Date().toISOString(),
      eventsCount: events.length,
    })
  } catch (error) {
    console.error("Erro ao processar iCal:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar disponibilidade",
        availability: {},
      },
      { status: 500 },
    )
  }
}
