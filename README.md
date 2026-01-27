**# Chef's Brain: Kitchen Scheduling Engine**

**Chef's Brain** is a logic-driven tool designed to replace inefficient FIFO (First-In-First-Out) kitchen workflows with an intelligent priority scheduling system. It optimizes kitchen throughput by synchronizing dishes based on cook times ("Prep Sync") and ensuring food safety through instant ingredient validation.

**## Core Data Structures**

This project demonstrates the practical application of three specific data structures to solve real-world kitchen problems:

1. **Min-Heap (Priority Queue):**
* **Purpose:** Dynamic Scheduling.
* **Logic:** Replaces standard order queues. It calculates a "Start Time" for every dish and floats the most urgent tasks to the top (Root Node), ensuring complex dishes (e.g., Steak) are started before fast dishes (e.g., Salad) so they finish simultaneously.


2. **Hash Map (Dictionary):**
* **Purpose:** Safety & Conflict Detection.
* **Logic:** Provides  instant lookup for ingredients. It cross-references incoming order tags (e.g., "Nut Allergy") against recipe data to immediately flag unsafe orders.


3. **Doubly Linked List (DLL):**
* **Purpose:** History & Undo Management.
* **Logic:** Maintains a navigable history of completed orders. Allows the chef to traverse backward/forward to review output logs or "Undo" a cleared ticket efficiently.



**## Complexity Analysis**

* **Order Insertion:**  via Heap.
* **Allergy Check:**  via Hash Map.
* **History Traversal:**  via DLL.
