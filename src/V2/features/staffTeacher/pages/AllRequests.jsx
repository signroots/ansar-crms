import SubmittedItemsPage from "../components/SubmittedItemsPage";

function AllRequests() {
  return (
    <SubmittedItemsPage
      endpoint="/api/sumbitted-request/list/"
      itemKind="request"
      itemLabel="Request"
      getIssueName={(request) => request.issue_request?.name || "N/A"}
      typeColor={{
        color: "#0f766e",
        bg: "#ecfeff",
        border: "#bae6fd",
      }}
    />
  );
}

export default AllRequests;
