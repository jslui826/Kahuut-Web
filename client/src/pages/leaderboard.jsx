import { useState, useEffect } from "react";


function Leaderboard() {
   const [players, setPlayers] = useState([]);
   useEffect(() => {
       const fetchLeaderboard = async () => {
           try {
               const response = await fetch("http://localhost:4000/api/leaderboard/top10");
               const data = await response.json();


               const sortedPlayers = data.sort((a, b) => b.score - a.score);
               setPlayers(sortedPlayers);
           } catch (error) {
               console.error("Error fetching leaderboard:", error);
           }
       };


       fetchLeaderboard();
   }, []);
   return (
       <div className="overflow-x-auto">
           <h3>______________________________</h3>
           <h1>Leaderboard</h1>
           <a href="../quizzes" className="text-l text-gray-600">Dashboard</a>


           <table className="table">
               {/* Table Head */}
               <thead>
                   <tr>
                       <th><h2>Rank</h2></th>
                       <th>Name</th>
                       <th>Team</th>
                       <th>Score</th>
                   </tr>
               </thead>


               {/* Table Body */}
               <tbody>
                   {players.map((player, index) => (
                       <tr key={player.id}>
                           <th><h3>{index + 1}</h3></th>
                           <td>
                               <div className="flex items-center gap-3">
                                   <div className="avatar">
                                       <div className="mask mask-squircle h-12 w-12">
                                           <img src={player.img} alt="Avatar" />
                                       </div>
                                   </div>
                                   <div className="font-bold">{player.name}</div>
                               </div>
                           </td>
                           <td>{player.team}</td>
                           <td>{player.score}</td>
                       </tr>
                   ))}
               </tbody>


               {/* Table Footer */}
               <tfoot>
                   <tr>
                       <th></th>
                       <th>Name</th>
                       <th>Team</th>
                       <th>Score</th>
                   </tr>
               </tfoot>
           </table>
       </div>
   );
}


export default Leaderboard;