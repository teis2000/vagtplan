export default function Home() {
  const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

  return (
    <main className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Vagtplan</h1>
        <p className="text-gray-500 text-sm mt-1">Uge 16 · April 2026</p>
      </header>

      <div className="grid gap-3">
        {days.map((day) => (
          <div
            key={day}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
          >
            <span className="font-medium">{day}</span>
            <span className="text-sm text-gray-400">Ingen vagt</span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        Vagtplan · Teis Johansen
      </div>
    </main>
  );
}
