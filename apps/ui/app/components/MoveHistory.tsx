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
          {/* {moves.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-3 italic">No moves yet</td>
            </tr>
          ) : (
            // moves.map((move, i) => (
            //   <tr key={i} className="odd:bg-yellow-100 even:bg-yellow-200">
            //     <td className="border px-2 py-1">{move.piece}</td>
            //     <td className="border px-2 py-1">{toChessNotation(move.from)}</td>
            //     <td className="border px-2 py-1">{toChessNotation(move.to)}</td>
            //     <td className="border px-2 py-1">{move.captured ?? "-"}</td>
            //   </tr>
            ))
          )} */}
        </tbody>
      </table>
    </div>
  );
}