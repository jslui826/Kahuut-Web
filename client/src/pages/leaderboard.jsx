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
           <h1>______________________________</h1>
           <h1>Leaderboard</h1>
           <a href="../quizzes" className="text-l text-gray-600">Dashboard</a>


           <table className="table">
               {/* Table Head */}
               <thead>
                   <tr>
                       <th><h1>Rank</h1></th>
                       <th><h1>Name</h1></th>
                       <th><h1>Team</h1></th>
                       <th><h1>Score</h1></th>
                   </tr>
               </thead>


               {/* Table Body */}
               <tbody>
                   {players.map((player, index) => (
                       <tr key={player.id}>
                           <th><h1>{index + 1}</h1></th>
                           <td>
                               <div className="flex items-center gap-3">
                                   <div className="avatar">
                                       <div className="mask mask-squircle h-24 w-24">
                                           <img src={player.img} alt="Avatar" />
                                       </div>
                                   </div>
                                   <div className="font-bold"><h1>{player.name}</h1></div>
                               </div>
                           </td>
                           <td><h1>{player.team}</h1></td>
                           <td><h1>{player.score}</h1></td>
                       </tr>
                   ))}
               </tbody>


               {/* Table Footer */}
               <tfoot>
                   <tr>
                       <th><h1>Rank</h1></th>
                       <th><h1>NameM</h1></th>
                       <th><h1>Team</h1></th>
                       <th><h1>Score</h1></th>
                   </tr>
               </tfoot>
           </table>
       </div>
   );
}


export default Leaderboard;