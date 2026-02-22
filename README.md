# 👨‍🍳 Chef's Brain: Kitchen Scheduling Engine

**Live Demo:** [https://chefs-brain-two.vercel.app/](https://chefs-brain-two.vercel.app/)

<table>
  <tr>
    <td width="50%"><img alt="image" src="https://github.com/user-attachments/assets/548643dd-f390-450a-a284-56544ee0adfd" /></td>
    <td width="50%"><img alt="image" src="https://github.com/user-attachments/assets/721a0ddb-cc59-418a-ba50-11e1eb3bf11c" /></td>
  </tr>
  <tr>
    <td width="50%"><img alt="image" src="https://github.com/user-attachments/assets/1ab60e6c-58d0-4b44-9b21-b77b471ac23b" /></td>
    <td width="50%"><img alt="image" src="https://github.com/user-attachments/assets/80f183d8-038d-491d-85f1-dcc30306d47f" /></td>
  </tr>
</table>

**Chef's Brain** is an intelligent priority scheduling system that replaces inefficient FIFO (First-In-First-Out) kitchen workflows. It optimizes kitchen throughput by synchronizing dishes based on cook times ("Prep Sync"), ensures food safety through instant ingredient validation, and uses adaptive learning to improve prep time accuracy.

---

## 🚀 Features

* **Dynamic Scheduling:** Calculates a "Start Time" for every dish so complex and fast dishes finish simultaneously.
* **Adaptive Learning for Prep Time:** Algorithms adjust and optimize prep time estimates based on real-world execution data.
* **Ingredients Suggestion:** Dynamically recommends ingredients to streamline the ordering and prep process.
* **Safety & Conflict Detection:** Instantly flags unsafe orders by cross-referencing incoming order tags (e.g., "Nut Allergy") against recipe data.
* **History & Undo Management:** Maintains a navigable history of completed orders, allowing chefs to quickly review or undo cleared tickets.

---

## 🛠️ Tech Stack & Deployment

* **Frontend:** React, Vite, Tailwind CSS (Hosted on **Vercel**)
* **Backend:** Java, Spring Boot (Hosted on **Render**)
* **Database:** PostgreSQL (Hosted on **Neon**)

---

## 🧱 Core Data Structures & Algorithms

This project relies on robust data structures and algorithms to solve real-world kitchen problems:

1.  **Min-Heap (Priority Queue)**
    * **Purpose:** Dynamic Scheduling.
    * **Logic:** Replaces standard order queues. It floats the most urgent tasks to the top (Root Node), prioritizing items by calculated start times.
2.  **Hash Map (Dictionary)**
    * **Purpose:** Safety & Conflict Detection.
    * **Logic:** Provides instant lookup for ingredients and allergy checks.
3.  **Doubly Linked List (DLL)**
    * **Purpose:** History & Undo Management.
    * **Logic:** Maintains a history of completed orders. Allows traversal backward/forward to review output logs or undo actions.
4.  **Adaptive Learning Algorithm**
    * **Purpose:** Prep Time Optimization.
    * **Logic:** Continuously refines expected preparation times to eliminate bottlenecks.

---

## 📊 Complexity Analysis

* **Order Insertion:** $O(\log N)$ via Min-Heap.
* **Allergy Check:** $O(1)$ via Hash Map.
* **History Traversal:** $O(1)$ via Doubly Linked List.
