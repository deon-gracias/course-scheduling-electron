export function schedule(courses, rooms, times, preferences) {
  let prefsList = [],
    availableTiming = "",
    foundRoom = false,
    enrollmentDiff = 0,
    tempTimes = new Set(times),
    courseRooms = {},
    courseTimings = {};

  for (let [courseKey, courseValue] of Object.entries(courses)) {
    foundRoom = false;

    // Set enrollment diff to highest
    enrollmentDiff = Number.MAX_VALUE;

    // Get Prefs List
    prefsList = preferences[courseKey] || [];

    // Find Suitable Room for Course
    for (let [roomsKey, roomsValue] of Object.entries(rooms)) {
      let enrollment = courseValue;

      if (
        roomsValue >= enrollment &&
        enrollmentDiff > roomsValue - enrollment
      ) {
        foundRoom = true;
        enrollmentDiff = roomsValue - enrollment;
        courseRooms[courseKey] = roomsKey;
      }
    }

    // Room not found
    if (!foundRoom) {
      throw new Error("Couldn't find room for " + courseKey);
    }

    // Check if row has preference
    if (prefsList.length > 0) {
      // Check for available time according to preference
      availableTiming = getAvailable(prefsList, courseTimings) || "";

      // Check if available course in found
      if (availableTiming === "") {
        throw new Error(
          "Couldn't find suitable course timings allotment according to preferred timing for " +
            courseKey
        );
      }
    } else {
      // Check if sufficient timings are available
      if (tempTimes.length < 1) {
        throw new Error("Insufficient timings for allotted courses");
      }

      // Get first available timing
      availableTiming = tempTimes.values().next().value;
    }

    // Allot timing for available course
    tempTimes.delete(availableTiming);
    courseTimings[availableTiming] = courseKey;
  }

  // === Room Wise ===
  let roomWise = {};

  for (let [, roomValue] of Object.entries(courseRooms)) {
    roomWise[roomValue] = makeRoomWiseCourses(
      courseRooms,
      courseTimings,
      roomValue
    );
  }

  // === Course wise ===
  let courseWise = {};

  for (let [courseRoomKey] of Object.entries(courseRooms)) {
    let courseData = makeCourseWiseRoom(
      courseRooms,
      courseTimings,
      courseRoomKey
    );

    courseWise[courseRoomKey] = courseData;
  }

  console.log(courseWise);

  return {
    rooms: courseRooms,
    times: courseTimings,
    roomWise: roomWise,
    courseWise: courseWise,
  };
}

function getAvailable(prefsList, allocatedCourses) {
  // Search for available timings
  for (let pref of prefsList) {
    if (!allocatedCourses.hasOwnProperty(pref)) return pref;
  }

  // Couldn't find preferred time
  return "";
}

function makeRoomWiseCourses(courseRooms, courseTimings, room) {
  let roomCourses = {};

  for (let [courseKey, courseValue] of Object.entries(courseRooms)) {
    if (courseValue === room) {
      for (let [timingKey, timingValue] of Object.entries(courseTimings)) {
        if (courseKey !== timingValue) continue;

        let dayTime = timingKey.split(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/, 2);

        let days = dayTime[0].split("");

        for (let i in days) {
          roomCourses[courseKey] = [days[i], dayTime[1]];
        }
      }
    }
  }

  return roomCourses;
}

function makeCourseWiseRoom(courseRooms, courseTimings, course) {
  let dayCourse = {},
    rooms = [];

  for (let [courseKey, courseValue] of Object.entries(courseRooms)) {
    if (courseKey === course) rooms.push(courseValue);
  }

  console.log(rooms);

  for (let [courseTimingKey, courseTimingValue] of Object.entries(
    courseTimings
  )) {
    if (courseTimingValue === course) {
      let dayTime = courseTimingKey.split(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/, 2);
      let days = dayTime[0].split("");

      for (let i in days) {
        dayCourse[days[i]] = [rooms[0], dayTime[1]];
      }
    }
  }

  return dayCourse;
}
