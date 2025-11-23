import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import { Button, ListGroup } from "react-bootstrap";
import React from "react";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import Loading from "../Loading";
import { showToast } from "../Toasts/ToastContainer";
import {v4 as uuid} from 'uuid';

const SortableItem = ({ stations, onDelete, onConnect, onDisconnect, isFirst }) => {
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        transition, 
        isDragging 
    } = useSortable({ id: stations.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        backgroundColor: isDragging ? "#f8f9fa" : "inherit",
    };

    return (
        <ListGroup.Item
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="align-items-center justify-content-between p-0"
        >
            {
                stations.stations.map((s, idx) => (
                    <div className="d-flex w-100 my-2" key={s._id}>
                        <p 
                            className="my-0 fs-3 mx-2 text-end"
                            style={{width: "3rem"}}
                        >
                            {stations.order}.
                        </p>
                        <p 
                            className="m-0 ps-0 fs-3"
                        >{s.name}</p>
                        <div className="ms-auto">
                            {
                                idx == 0 ?
                                <>
                                    {
                                        !isFirst &&
                                        <Button 
                                            onClick={() => {onConnect(stations.order)}} 
                                            className="me-2"
                                        >
                                            <i className="bi bi-chevron-bar-up" />
                                        </Button>
                                    }
                                </> :
                                <Button 
                                    onClick={() => {onDisconnect(s._id, stations.order)}}
                                    variant="warning"
                                    className="me-2"
                                >
                                    <i className="bi bi-ban" />
                                </Button>
                            }
                            <Button 
                                variant="danger" 
                                onClick={() => onDelete(s._id, stations.order)}
                                className="me-2"
                            >
                                <i className="bi bi-trash" />
                            </Button>
                        </div>
                    </div>
                ))
            }
        </ListGroup.Item>
    );
};

export default function OrderStations() {
    const fetch = useAuthFetch();
    const [orderedStations, setOrderedStations] = React.useState([]);
    const [ignoredStations, setIgnoredStations] = React.useState([]);
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        })
    )
    const queryClient = useQueryClient();

    const { data, loading: stationsLoading } = useQuery({
        queryKey: ["stations", "order"],
        queryFn: async () => {
            const response = await fetch("/api/stations");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity
    });

    const { data: stationsOrdering, loading: orderLoading } = useQuery({
        queryKey: ["stations", "order", "stationOrdering"],
        queryFn: async () => {
            const response = await fetch("/api/opendays/active");
            const data = await response.json();
            return data.stationOrdering;
        },
        staleTime: Infinity
    })
    
    const saveMutation = useMutation({
        mutationKey: ["stations", "order", "save"],
        mutationFn: async () => {
            const stations = orderedStations.reduce((acc, curr) => {
                for (let station of curr.stations) {
                    acc.push({
                        id: station._id,
                        order: curr.order
                    });
                }
                return acc;
            }, []);
            await fetch(`/api/opendays/active/stationsOrder`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(stations)
                }
            );
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(["stationOrdering"]);
            showToast("Success!", "", "Stations successfully reordered", "Success")
        }
    })

    React.useEffect(() => {
        if (data && stationsOrdering) {
            const stationsOrdered = data
                .filter(s => stationsOrdering.find(o => o.id == s._id));
            for (let idx in stationsOrdered) {
                let station = stationsOrdered[idx];
                let stationWithOrder = stationsOrdering.find(s => s.id == station._id);
                station.order = stationWithOrder.order;
            }
            const orderedStations = data
                .filter(s => s.order)
                .sort((a, b) => a.order - b.order)
                .reduce((acc, s) => {
                    let stationArray = acc.find(a => a.order == s.order);
                    if (stationArray) stationArray.stations.push(s);
                    else {
                        stationArray = {
                            stations: [s],
                            order: s.order,
                            id: uuid()
                        }
                        acc.push(stationArray);
                    }
                    return acc;
                }, []);
            const ignoredStations = data.filter(s => !s.order);
            setOrderedStations(orderedStations);
            setIgnoredStations(ignoredStations);
        }
    }, [data, stationsOrdering]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;


        const oldIndex = orderedStations.findIndex((s) => s.id === active.id);
        const newIndex = orderedStations.findIndex((s) => s.id === over.id);
        
        const newStationsOrdering = arrayMove(orderedStations, oldIndex, newIndex)
            .map((s, i) => ({ ...s, order: i + 1 }));
    
        setOrderedStations(newStationsOrdering);
    };

    const handleDelete = (id, order) => {
        let stationOrdering = orderedStations[order - 1];
        let s = stationOrdering.stations.find(s => s._id == id);
        if (stationOrdering.stations.length == 1) {
            let newOrderedStations = [...orderedStations];
            newOrderedStations.splice(order - 1, 1);
            for (let ordering of newOrderedStations.slice(order - 1)) ordering.order--;
            setOrderedStations(newOrderedStations);
        } else {
            let idx = stationOrdering.stations.indexOf(s);
            stationOrdering.stations.splice(idx, 1);
        }
        s.order = null;
        setIgnoredStations([...ignoredStations, s]);
    };

    const handleConnect = (order) => {
        let stationOrdering = orderedStations[order - 1];
        let newOrderedStations = [...orderedStations];
        newOrderedStations.splice(order - 1, 1);
        for (let ordering of newOrderedStations.slice(order - 1)) ordering.order--;
        for (let s of stationOrdering.stations) s.order--;
        newOrderedStations[order - 2].stations.push(...stationOrdering.stations);
        setOrderedStations(newOrderedStations);
    }

    const handleDisconnect = (id, order) => {
        let stationOrdering = orderedStations[order - 1];
        let s = stationOrdering.stations.find(s => s._id == id);
        let newOrderedStations = [...orderedStations];
        let newStationOrder = {
            stations: [s],
            order: order + 1,
            id: uuid()
        }
        for (let ordering of newOrderedStations.slice(order)) ordering.order++;
        let idx = stationOrdering.stations.indexOf(s);
        stationOrdering.stations.splice(idx, 1);
        newOrderedStations.splice(order, 0, newStationOrder);
        setOrderedStations(newOrderedStations);
    }

    if (stationsLoading || orderLoading) return <Loading/>;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Order Stations</h2>
                <Button onClick={() => {saveMutation.mutate()}}>Save</Button>
            </div>
            <h3>Selected Stations</h3>
                {
                    /** 
                     * DndContext required for drag-n-drop behaviour.
                     * parameters:
                     * 
                     * sensors: Which movements should be listened to
                     * collisionDetection: how to decided the order
                     * onDragEnd: What to do when the user stops dragging
                    */
                }
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                >
                    {
                        /** 
                         * SortableContext required for sorting.
                         * parameters:
                         * 
                         * items: the ids of each element
                         * strategy: which strategy to apply for sorting
                        */
                    }
                        <SortableContext 
                        items={orderedStations.map(s => s.id)} 
                        strategy={verticalListSortingStrategy}
                    >
                        <ListGroup>
                            {
                                orderedStations.map((s, idx) => (
                                    <SortableItem 
                                        key={s.id} 
                                        stations={s} 
                                        onDelete={handleDelete}
                                        onConnect={handleConnect}
                                        onDisconnect={handleDisconnect}
                                        isFirst={idx == 0}
                                    />
                                ))
                            }
                        </ListGroup>
                    </SortableContext>
                </DndContext>
            <h3 className="mt-3">Ignored Stations</h3>
            <ListGroup>
                {
                    ignoredStations.map(s => (
                        <ListGroup.Item key={s._id} className="d-flex align-items-center justify-content-between">
                            <p className="m-0 fs-3">{s.name}</p>
                            <Button variant="success" onClick={() => {
                                let nextOrder = orderedStations.length + 1;
                                s.order = nextOrder;
                                setOrderedStations([...orderedStations, {
                                    stations: [s],
                                    order: nextOrder,
                                    id: uuid()
                                }]);
                                let stationIdx = ignoredStations.indexOf(s);
                                let newIgnoredStations = [...ignoredStations];
                                newIgnoredStations.splice(stationIdx, 1)
                                setIgnoredStations(newIgnoredStations);
                            }}>
                                <i className="bi bi-plus-square"/>
                            </Button>
                        </ListGroup.Item>
                    ))
                }
            </ListGroup>
        </>
    )
}