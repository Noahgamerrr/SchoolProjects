import PropTypes from "prop-types";
import "./tooltip.css";
import { Area, AreaChart, CartesianGrid, Label, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="customTooltip">
                <p className="label">{`${label}`}</p>
                <p className="tooltipDetails" style={{color: "#8884d8"}}>{`Tours started: ${payload[0].value}`}</p>
                <p className="tooltipDetails" style={{color: "#82ca9d"}}>{`Visitors: ${payload[1].value}`}</p>
            </div>
        );
    }

    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string
}

export default function ToursStartedDiagram({ toursStarted }) {
    return (
        <>
            <h2>Tour visits</h2>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                    width={500} 
                    height={400} 
                    data={toursStarted}
                    margin={{bottom: 30, left: 10, top: 10, right: 15}}
                >
                    <defs>
                        <linearGradient id="colorTour" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="hour">
                        <Label value="Hour started at" offset={-10} position="insideBottom"/>
                    </XAxis>
                    <YAxis yAxisId="left" label={{value: "Tours started", angle: -90, position: "insideLeft", offset: 10}}/>
                    <YAxis yAxisId="right" orientation="right" label={{value: "Visitors", angle: 90, position: "insideRight", offset: 0}}/>
                    <Tooltip labelStyle={{color: "#000"}} content={<CustomTooltip/>}/>
                    <Area yAxisId="left" type="monotone" dataKey="amount" stroke="#8884d8" fill="url(#colorTour)"/>
                    <Area yAxisId="right" type="monotone" dataKey="visitors" stroke="#82ca9d" fill="url(#colorVisitor)"/>
                </AreaChart>
            </ResponsiveContainer>
        </>
    )
}

ToursStartedDiagram.propTypes = {
    toursStarted: PropTypes.object
}
