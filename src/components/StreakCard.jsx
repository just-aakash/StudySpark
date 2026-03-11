export default function StreakCard(){

const currentStreak=7
const bestStreak=15

return(

<div className="bg-slate-800 p-6 rounded-xl shadow-lg w-64">

<h2 className="text-lg font-semibold mb-2">
🔥 Study Streak
</h2>

<p className="text-3xl font-bold">
{currentStreak} Days
</p>

<p className="text-sm text-gray-400 mt-2">
Best: {bestStreak} Days
</p>

</div>

)

}