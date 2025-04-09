"use client";
import { useEffect, useState } from "react";
import { Table, Badge, Button, Spinner } from "flowbite-react";

const TutorRequestsPage = () => {
  const [requests, setRequests] = useState<any[]>([]); // Default to an empty array
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch tutor requests from the API
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:9000/getAllRequests");
      const data = await res.json();
      setRequests(data || []); // Ensure we default to an empty array if data is null or undefined
    } catch (error) {
      console.error("Error fetching tutor requests:", error);
      setRequests([]); // In case of error, default to empty array
    } finally {
      setLoading(false);
    }
  };

  // Run the fetchRequests function when the component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle the "Accept" action
  const handleAccept = async (user_id: string, requestId: string) => {
    setActionLoading(user_id);
    try {
      const res = await fetch(`http://localhost:9000/users/updateToTutor/${user_id}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (res.ok) {
        // Remove the accepted request from the list
        setRequests((prev) => prev.filter((req) => req.user_id !== user_id));

        // Delete the accepted request after successful upgrade
        await handleDelete(requestId); // Delete after accepting
      } else {
        console.error("Accept error:", data.error);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle the "Decline" action
  const handleDecline = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`http://localhost:9000/deleteRequest/${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        // Remove the declined request from the list
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else {
        console.error("Decline error:", data.error);
      }
    } catch (error) {
      console.error("Error declining request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle deletion of a request
  const handleDelete = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:9000/deleteRequest/${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Delete error:", data.error);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  // Handle loading state or display a fallback message if no requests
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md dark:shadow-dark-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="text-xl font-semibold mb-4">Tutor Requests</h5>
      <div className="overflow-x-auto">
        {requests.length === 0 ? (
          <div>No requests found.</div> // Display message if no requests
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>User ID</Table.HeadCell>
              <Table.HeadCell>Skills</Table.HeadCell>
              <Table.HeadCell>Motivation</Table.HeadCell>
              <Table.HeadCell>Availability</Table.HeadCell>
              <Table.HeadCell>Experience</Table.HeadCell>
              <Table.HeadCell>Requested At</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {requests.map((req) => (
                <Table.Row key={req.id}>
                  <Table.Cell>{req.user_id}</Table.Cell>
                  <Table.Cell>{req.skills?.join(", ")}</Table.Cell>
                  <Table.Cell>{req.motivation}</Table.Cell>
                  <Table.Cell>{req.availability}</Table.Cell>
                  <Table.Cell>{req.teaching_experience}</Table.Cell>
                  <Table.Cell>{new Date(req.created_at).toLocaleString()}</Table.Cell>
                  <Table.Cell className="flex gap-2">
                    <Button
                      color="success"
                      size="xs"
                      onClick={() => handleAccept(req.user_id, req.id)} // Passing both user_id and requestId
                      isProcessing={actionLoading === req.user_id}
                    >
                      Accept
                    </Button>
                    <Button
                      color="failure"
                      size="xs"
                      onClick={() => handleDecline(req.id)} // Decline still uses requestId
                      isProcessing={actionLoading === req.id}
                    >
                      Decline
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TutorRequestsPage;
