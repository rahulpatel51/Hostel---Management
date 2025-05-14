import express from "express";
import {
  allocateRoom,
  deallocateRoom,
  getAllAllocatedRooms,
  getAllStudents,
  getStudentWithRoomDetails,
} from "../Controllers/roomAllocationController.js";

const router = express.Router();

router.post("/allocate", allocateRoom);
router.post("/deallocate", deallocateRoom);
router.get("/rooms", getAllAllocatedRooms);
router.get("/students", getAllStudents);
router.get("/student/:id", getStudentWithRoomDetails);

export default router;
