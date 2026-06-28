<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: login.php");
    exit();
}
include 'db.php';
?>

<h1>Welcome, <?php echo $_SESSION['admin']; ?></h1>
<a href="manage_menu.php">Manage Menu</a><br>
<a href="view_orders.php">View Orders</a><br>
<a href="manage_users.php">Manage Users</a><br>
<a href="logout.php">Logout</a>
