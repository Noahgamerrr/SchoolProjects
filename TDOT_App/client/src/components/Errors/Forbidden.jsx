import ClientError from "./ClientError";

function Forbidden() {
    return (
        <ClientError title={"Forbidden Access!"}>
            Whoops! Seems like you tried to access page for which you&apos;re unauthorized!
        </ClientError>
    );
}

export default Forbidden;
