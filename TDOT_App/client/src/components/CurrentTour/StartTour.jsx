import { Button, Form } from 'react-bootstrap'
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '../Toasts/ToastContainer';
import { useMsal } from '@azure/msal-react';
import { useAuthFetch } from '../../lib/MSAL';
import { useState } from 'react';
import PropTypes from "prop-types"
import FormModal from '../Modal/FormModal';


export default function StartTour({ guideId}) {
    const { instance } = useMsal();
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();
    const [modalEvent, setModalEvent] = useState({function:null,title:null})
    const [visitors, setVisitors] = useState(1);

    const shortform = instance.getActiveAccount().username.split("@")[0];

    const createTour = async (visitors) => {
        let res = await fetch(`/api/students/${guideId}/tours`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "guide": guideId,
                "startTime": new Date(),
                "numberOfVisitors": parseInt(visitors)
            })
        });
        queryClient.invalidateQueries(["guide-tours",`guide-${shortform}`]);
        if (res.status >= 400) {
            let resText = await res.text();
            showToast("ERROR creating tour!",res.status,resText,"Danger");
            throw new Error(await resText);
        }
        else{
            showToast("Successfully created new tour!",'',"Have fun on the tour 😃","Success");
        }
    };

    return(
        <div>
            <FormModal
                title={modalEvent.title}
                confirmColor={modalEvent.confirmColor}
                show={modalEvent.function}
                onClose={()=>setModalEvent({function:null,title:null})}
                onSave={()=>{
                    modalEvent.function(visitors);
                }}
                createBtnText={"Confirm"}
            >
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Form.Group className="mb-3" controlId="formVisitors">
                        <Form.Label>Number of Visitors:</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={visitors}
                            onChange={(e) => setVisitors(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </FormModal>
            <h2>No current Tour...</h2>
            <Button 
                className="btn-success" 
                style={{
                    fontSize: 7+'em',
                    textAlign: 'left',
                    width: 100+'%',
                    height: 100+'%'
                }}
                onClick={()=>setModalEvent({function:createTour, title:"Start a new Tour?"})}
            >Let's fix that!</Button>
        </div>
    )
}

StartTour.propTypes = {
    guideId: PropTypes.string,
}