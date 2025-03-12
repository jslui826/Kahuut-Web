import { people } from '../data/data.js'

function Leaderboard() {
    const listItems = people.map(person =>
        <tr>
            <th>
            <label>
                <h3>{person.id + 1}</h3>
            </label>
            </th>
            <td>
            <div className="flex items-center gap-3">
                <div className="avatar">
                <div className="mask mask-squircle h-12 w-12">
                    <img
                    src={person.img}
                    alt="Avatar Tailwind CSS Component" />
                </div>
                </div>
                <div>
                <div className="font-bold">{person.name}</div>
                </div>
            </div>
            </td>
            <td>
            {person.team}
            <br />
            </td>
            <td>{person.score}</td>
        </tr>
    )

    return(
        <div className="overflow-x-auto">
            <h3>______________________________</h3>
            <h1>Leaderboard</h1>
            <a href="../quizzes" className="text-l text-gray-600">Dashboard</a>
        <table className="table">
            {/* head */}
            <thead>
            <tr>
                <th>
                <label>
                    <h2>Rank</h2>
                </label>
                </th>
                <th>Name</th>
                <th>Team</th>
                <th>Score</th>
                <th></th>
            </tr>
            </thead>
            <tbody>{listItems}</tbody>
            <tfoot>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Team</th>
                <th>Score</th>
                <th></th>
            </tr>
            </tfoot>
        </table>
        </div>
    )
}

export default Leaderboard