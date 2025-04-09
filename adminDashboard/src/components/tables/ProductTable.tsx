import { useEffect, useState } from "react";
import { Table, Badge, Spinner } from "flowbite-react";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:9000/users");
        const data = await response.json();
        setUsers(data.user_items);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="text-xl font-semibold mb-4">Users</h5>
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>First Name</Table.HeadCell>
            <Table.HeadCell>Last Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Phone</Table.HeadCell>
            <Table.HeadCell>User Type</Table.HeadCell>
            <Table.HeadCell>Skills</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {users.map((user) => (
              <Table.Row key={user.user_id}>
                <Table.Cell>{user.firstname}</Table.Cell>
                <Table.Cell>{user.lastname}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.phone}</Table.Cell>
                <Table.Cell>
                  <Badge color={user.usertype === "ADMIN" ? "info" : "success"}>
                    {user.usertype}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {user.skills?.length > 0 ? user.skills.join(", ") : "—"}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export { UserTable };
