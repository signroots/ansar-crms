import SubmittedItemsPage from "../components/SubmittedItemsPage";

function AllComplaints() {
  return (
    <SubmittedItemsPage
      endpoint="/api/sumbitted-complaint/list/"
      itemKind="complaint"
      itemLabel="Complaint"
      getIssueName={(complaint) => complaint.issue_complaint?.name || "N/A"}
      typeColor={{
        color: "#b91c1c",
        bg: "#fef2f2",
        border: "#fecaca",
      }}
    />
  );
}

export default AllComplaints;
