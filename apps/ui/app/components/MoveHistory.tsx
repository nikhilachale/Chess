"use client";



export default function MoveHistory() {
  return (
    <div className="w-96 shadow-lg rounded-xl bg-yellow-50 p-4 border border-yellow-300">
      <table className="min-w-full border border-yellow-300 text-yellow-900 text-center">
        <thead className="bg-yellow-700 text-yellow-100">
          <tr>
            <th className="border px-4 py-2">Piece</th>
            <th className="border px-4 py-2">From</th>
            <th className="border px-4 py-2">To</th>
            <th className="border px-4 py-2">Captured</th>
          </tr>
        </thead>
        <tbody>
         
        </tbody>
      </table>
    </div>
  );
}