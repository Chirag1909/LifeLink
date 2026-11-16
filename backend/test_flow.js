const API = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `HTTP error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runE2ETest() {
  console.log('================================================================');
  console.log(' LIFELINK SPRING BOOT & JDBC FULL INTEGRATION FLOW TEST');
  console.log('================================================================\n');

  try {
    // STEP 1: LOGIN AS REQUESTER
    console.log('[Step 1] Logging in as Requester (robert@requester.com)...');
    const reqLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'robert@requester.com',
        password: 'Password@123'
      })
    });
    const requesterToken = reqLoginRes.token;
    const requesterUser = reqLoginRes.user;
    console.log(` -> Requester Logged in: ${requesterUser.name} (${requesterUser.city})`);

    // STEP 2: REQUESTER POSTS EMERGENCY BLOOD REQUEST
    console.log('\n[Step 2] Requester creating new emergency blood request in Spring Boot...');
    const neededBy = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 19);
    const newReqRes = await apiRequest('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${requesterToken}` },
      body: JSON.stringify({
        patientName: 'David Davidson',
        bloodGroup: 'O-',
        unitsNeeded: 2,
        hospital: 'NYU Langone Medical Center, ICU 5',
        city: 'New York',
        contactPhone: '+1 555-0301',
        urgency: 'Critical',
        neededBy,
        notes: 'Emergency accident surgery requires immediate O- blood.'
      })
    });
    const createdRequest = newReqRes.request;
    console.log(` -> Blood Request created! ID: ${createdRequest._id || createdRequest.id}`);
    console.log(` -> Status: ${createdRequest.status}, Urgency: ${createdRequest.urgency}, Patient: ${createdRequest.patientName} (${createdRequest.bloodGroup})`);

    // STEP 3: REGISTER FRESH DONOR (O-, New York)
    const testEmail = `test.donor.${Date.now()}@donor.com`;
    console.log(`\n[Step 3] Registering fresh eligible Donor (${testEmail})...`);
    const donorRegRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alex Donor',
        email: testEmail,
        password: 'Password@123',
        phone: '+1 555-0999',
        role: 'donor',
        bloodGroup: 'O-',
        city: 'New York'
      })
    });
    const donorToken = donorRegRes.token;
    const donorUser = donorRegRes.user;
    console.log(` -> Donor Registered: ${donorUser.name} (${donorUser.bloodGroup}, ${donorUser.city})`);
    console.log(` -> Donor Initial Eligibility: isEligible = ${donorUser.eligibility.isEligible} (${donorUser.eligibility.reason})`);

    // STEP 4: DONOR FINDS MATCHING REQUEST
    console.log('\n[Step 4] Donor querying matching requests...');
    const matchRes = await apiRequest('/requests?scope=compatible', {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const reqId = createdRequest._id || createdRequest.id;
    const foundReq = matchRes.requests.find((r) => (r._id == reqId || r.id == reqId));
    if (!foundReq) {
      throw new Error('Created request was not found in donor matching requests list!');
    }
    console.log(` -> Found matching request on donor dashboard for patient: ${foundReq.patientName}`);

    // STEP 5: DONOR ACCEPTS REQUEST
    console.log('\n[Step 5] Donor accepting the emergency request...');
    const acceptRes = await apiRequest(`/requests/${reqId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    console.log(` -> Response: ${acceptRes.message}`);
    console.log(` -> Request status updated to: ${acceptRes.request.status}`);
    console.log(` -> Accepted by: ${acceptRes.request.acceptedBy.name}`);

    // STEP 6: REQUESTER VIEWS REQUEST & REVEALED DONOR PHONE
    console.log('\n[Step 6] Requester checking accepted request and unlocked donor contact...');
    const reqCheckRes = await apiRequest(`/requests/${reqId}`, {
      headers: { Authorization: `Bearer ${requesterToken}` }
    });
    const updatedReq = reqCheckRes.request;
    console.log(` -> Requester sees status: ${updatedReq.status}`);
    console.log(` -> Accepted Donor Name: ${updatedReq.acceptedBy.name}`);
    console.log(` -> Revealed Donor Phone Number: ${updatedReq.acceptedBy.phone}`);
    if (updatedReq.acceptedBy.phone.includes('*')) {
      throw new Error('Donor phone number was unexpectedly masked for the request owner!');
    }
    console.log(' -> Phone number successfully revealed to requester!');

    // STEP 7: REQUESTER MARKS REQUEST AS FULFILLED
    console.log('\n[Step 7] Requester marks request as Fulfilled in Spring Boot...');
    const fulfillRes = await apiRequest(`/requests/${reqId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${requesterToken}` },
      body: JSON.stringify({ status: 'Fulfilled' })
    });
    console.log(` -> Request status: ${fulfillRes.request.status}`);
    console.log(` -> Donation Record generated: ID ${fulfillRes.donation?._id || fulfillRes.donation?.id}, Status: ${fulfillRes.donation?.status}`);

    // STEP 8: CHECK DONOR'S UPDATED STATUS & 90-DAY COOLDOWN
    console.log('\n[Step 8] Verifying donor 90-day cooldown and updated eligibility in Spring Boot...');
    const donorProfileRes = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const updatedDonor = donorProfileRes.user;
    console.log(` -> Donor lastDonationDate: ${updatedDonor.lastDonationDate}`);
    console.log(` -> Donor isEligible: ${updatedDonor.eligibility.isEligible}`);
    console.log(` -> Reason: ${updatedDonor.eligibility.reason}`);
    console.log(` -> Days Remaining: ${updatedDonor.eligibility.daysRemaining}`);
    console.log(` -> Next Eligible Date: ${updatedDonor.eligibility.nextEligibleDate}`);

    if (updatedDonor.eligibility.isEligible !== false) {
      throw new Error('Donor should not be eligible immediately after fulfilled donation!');
    }
    if (updatedDonor.eligibility.daysRemaining < 89) {
      throw new Error(`Expected cooldown ~90 days, got ${updatedDonor.eligibility.daysRemaining}`);
    }

    // STEP 9: CHECK DONOR'S DONATION HISTORY
    console.log('\n[Step 9] Checking donor donation history list from JDBC repository...');
    const historyRes = await apiRequest('/donors/history', {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    console.log(` -> Total completed donations in history: ${historyRes.count}`);
    const latestDonation = historyRes.history[0];
    console.log(` -> Latest donation for patient: ${latestDonation.request?.patientName}, Hospital: ${latestDonation.hospital}`);

    // STEP 10: VERIFY PUBLIC SEARCH PRIVACY MASKING
    console.log('\n[Step 10] Checking public donor search privacy protection...');
    const publicDonorsRes = await apiRequest('/donors?city=New York');
    console.log(` -> Found ${publicDonorsRes.count} public eligible donors in New York`);
    publicDonorsRes.donors.forEach((d) => {
      console.log(`    Donor: ${d.name} (${d.bloodGroup}) -> Phone: ${d.phone}`);
      if (!d.phone.includes('*')) {
        throw new Error(`Public donor phone is not masked: ${d.phone}`);
      }
    });

    console.log('\n================================================================');
    console.log(' ALL 10 SPRING BOOT & JDBC E2E CHECKS PASSED WITH ZERO ERRORS! ');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n[TEST FAILED]:', err.data || err.message);
    process.exit(1);
  }
}

runE2ETest();
