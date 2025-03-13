import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import team1 from "/assets/genz.jpg";
import team2 from "/assets/hyperventilate.png";
import team3 from "/assets/crymoji.png";

function Leaderboard() {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [showTeams, setShowTeams] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const images = [team1, team2, team3]; // Team images based on rankings

    useEffect(() => {
        const fetchIndividualLeaderboard = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:4000/api/leaderboard/top10");
                const data = await response.json();


                const sortedPlayers = data.sort((a, b) => b.score - a.score);
                setIsLoading(false);
                setPlayers(sortedPlayers);
            } catch (error) {
                console.error("Error fetching individual leaderboard: ", error);
            }
        };

        fetchIndividualLeaderboard();
    }, []);

    useEffect(() => {
        const fetchTeamLeaderboard = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:4000/api/leaderboard/teams");
                const data = await response.json();

                const sortedTeams = data.sort((a, b) => b.score - a.score);
                setIsLoading(false);
                setTeams(sortedTeams);
            } catch (error) {
                console.error("Error fetching team leaderboard: ", error);
            }
        };

        fetchTeamLeaderboard();
    }, []);

    // Either show loading wheel, individual leaderboard, or team leaderboard
    return (
        <div>
        { isLoading ? 
        <span className="loading loading-spinner loading-lg flex items-center justify-center h-screen loader m-auto"></span> : 
        <div className="overflow-x-auto">
            <div className="font-bold"><h1 style={{ marginTop: 50 }}>🏆Leaderboard🏆</h1></div>
            <label className="swap">
                <input type="checkbox" onClick={e => setShowTeams(e.target.checked)}/>
                <div className="font-bold swap-on">SHOW INDIVIDUAL SCORE</div>
                <div className="font-bold swap-off">SHOW TEAM SCORE</div>
            </label>
            <div className="flex w-full flex-col">
                <div className="divider divider-neutral"></div>
            </div>

            {showTeams ? 
                <table className="table">
                {/* Table Head */}
                <thead>
                    <tr>
                        <th><h1>Rank</h1></th>
                        <th><h1>Team Name</h1></th>
                        <th><h1>Score</h1></th>
                    </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                    {teams.map((team, index) => (
                        <tr key={index}>
                            <th><h1>{index + 1}</h1></th>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="mask mask-squircle h-24 w-24">
                                            <img src={images[index]} alt="Avatar" />
                                        </div>
                                    </div>
                                    <div className="font-bold"><h1>{team.team}</h1></div>
                                </div>
                            </td>
                            <td><h1>{team.totalScore}</h1></td>
                        </tr>
                    ))}
                </tbody>
                {/* Table Footer */}
                <tfoot>
                    <tr>
                        <th><h1>Rank</h1></th>
                        <th><h1>Team Name</h1></th>
                        <th><h1>Score</h1></th>
                    </tr>
                </tfoot>
            </table> :
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
                        <th><h1>Name</h1></th>
                        <th><h1>Team</h1></th>
                        <th><h1>Score</h1></th>
                    </tr>
                </tfoot>
            </table>
            }
            <div className="flex w-full flex-col">
                <div className="divider divider-neutral"></div>
            </div>
            <button className="btn btn-wide btn-outline" onClick={() => navigate("/quizzes")} style={{ marginBottom: 25 }}>Go Back</button>
        </div>}
        </div>
    );
}


export default Leaderboard;