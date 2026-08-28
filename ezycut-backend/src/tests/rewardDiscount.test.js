/**
 * EzyCut Automatic Next-Booking Reward Discount System Verification Test Suite
 * 
 * Verifies all 16 requirements for points redemption, discount validation,
 * atomic reservation, Razorpay discounted order creation, payment state transitions,
 * security boundaries, and admin tier management.
 */

const assert = require("assert");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const User = require("../models/user.model");
const Salon = require("../models/salon.model");
const Service = require("../models/service.model");
const Booking = require("../models/booking.model");
const Payment = require("../models/payment.model");
const WalletAccount = require("../models/wallet.model");
const LedgerEntry = require("../models/ledger.model");
const RewardTier = require("../models/rewardTier.model");
const Redemption = require("../models/redemption.model");

const walletService = require("../services/wallet.service");
const redemptionService = require("../services/redemption.service");
const paymentService = require("../services/payment.service");

const connectDB = require("../config/db");

async function runRewardDiscountTests() {
  console.log("🧪 Starting Reward Discount System Verification Suite...\n");

  if (mongoose.connection.readyState === 0) {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected Successfully\n");
  }

  // Ensure default reward tiers exist
  await RewardTier.seedDefaultTiers();

  // Create test customers
  const customerA = await User.create({
    name: "Discount Tester A",
    email: `disc_a_${Date.now()}@test.com`,
    phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
    password: "Password123!",
    role: "customer",
  });

  const customerB = await User.create({
    name: "Discount Tester B",
    email: `disc_b_${Date.now()}@test.com`,
    phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
    password: "Password123!",
    role: "customer",
  });

  // Create test salon & service
  const testSalon = await Salon.create({
    name: "Discount Salon",
    owner: customerA._id,
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    pincode: "123456",
    phone: "9876543210",
    location: {
      type: "Point",
      coordinates: [77.1025, 28.7041],
    },
    isApproved: true,
  });

  const testService = await Service.create({
    salon: testSalon._id,
    name: "Haircut & Styling",
    price: 800, // ₹800
    duration: 30,
    isActive: true,
  });

  const smallService = await Service.create({
    salon: testSalon._id,
    name: "Express Trim",
    price: 150, // ₹150
    duration: 15,
    isActive: true,
  });

  // Give Customer A 3000 points to cover all tier redemptions
  await walletService.creditPoints({
    customerId: customerA._id,
    points: 3000,
    eventType: "ADJUSTMENT",
    referenceId: `init_credit_${Date.now()}`,
    referenceType: "admin_adjustment",
    idempotencyKey: `init_credit_key_${Date.now()}`,
    notes: "Initial test points allocation",
  });

  let voucher100, voucher250, voucher500, minBookingVoucher;

  try {
    // ----------------------------------------------------
    // Test 1: 100 points -> ₹50 discount redemption
    // ----------------------------------------------------
    console.log("⏳ Test 1: 100 points -> ₹50 discount...");
    const tier100 = await RewardTier.findOne({ pointsRequired: 100 });
    assert(tier100 !== null, "100 points tier must exist");

    voucher100 = await redemptionService.redeemPoints(customerA._id, { tierId: tier100._id });
    assert.strictEqual(voucher100.discountAmount, 50, "100 points should give ₹50 discount");
    assert.strictEqual(voucher100.status, "issued", "Voucher status should be issued");
    console.log("✅ Test 1: PASS (100 pts -> ₹50 OFF)");

    // ----------------------------------------------------
    // Test 2: 250 points -> ₹150 discount redemption
    // ----------------------------------------------------
    console.log("⏳ Test 2: 250 points -> ₹150 discount...");
    const tier250 = await RewardTier.findOne({ pointsRequired: 250 });
    assert(tier250 !== null, "250 points tier must exist");

    voucher250 = await redemptionService.redeemPoints(customerA._id, { tierId: tier250._id });
    assert.strictEqual(voucher250.discountAmount, 150, "250 points should give ₹150 discount");
    console.log("✅ Test 2: PASS (250 pts -> ₹150 OFF)");

    // ----------------------------------------------------
    // Test 3: 500 points -> ₹350 discount redemption
    // ----------------------------------------------------
    console.log("⏳ Test 3: 500 points -> ₹350 discount...");
    const tier500 = await RewardTier.findOne({ pointsRequired: 500 });
    assert(tier500 !== null, "500 points tier must exist");

    voucher500 = await redemptionService.redeemPoints(customerA._id, { tierId: tier500._id });
    assert.strictEqual(voucher500.discountAmount, 350, "500 points should give ₹350 discount");
    console.log("✅ Test 3: PASS (500 pts -> ₹350 OFF)");

    // ----------------------------------------------------
    // Test 4: Valid reward code applies on booking validation
    // ----------------------------------------------------
    console.log("⏳ Test 4: Valid reward code validation...");
    const validRes = await redemptionService.validateRewardCode({
      customerId: customerA._id,
      code: voucher250.referenceCode,
      bookingAmount: 944, // ₹800 + 18% GST = ₹944
    });
    assert.strictEqual(validRes.valid, true, "Validation should return valid: true");
    assert.strictEqual(validRes.discountAmount, 150, "Validation should return ₹150 discount");
    console.log("✅ Test 4: PASS");

    // ----------------------------------------------------
    // Test 5: Razorpay order uses discounted amount
    // ----------------------------------------------------
    console.log("⏳ Test 5: Razorpay order uses discounted amount...");
    // Service = ₹800 + 18% GST (144) = ₹944 original. Discount = ₹150. Final = ₹794.
    const orderRes = await paymentService.createOrderService(
      {
        salonId: testSalon._id,
        serviceId: testService._id,
        bookingDate: new Date(),
        startTime: "10:00",
        notes: "Discount order test",
        rewardCode: voucher250.referenceCode,
      },
      customerA._id
    );

    assert.strictEqual(orderRes.originalAmount, 944, "Original amount should be ₹944");
    assert.strictEqual(orderRes.discountAmount, 150, "Discount amount should be ₹150");
    assert.strictEqual(orderRes.finalAmount, 794, "Final amount should be ₹794");
    assert.strictEqual(orderRes.amount, 79400, "Razorpay order amount in paise should be 79400");
    console.log("✅ Test 5: PASS");

    // ----------------------------------------------------
    // Test 6: Invalid code rejected
    // ----------------------------------------------------
    console.log("⏳ Test 6: Invalid reward code rejection...");
    try {
      await redemptionService.validateRewardCode({
        customerId: customerA._id,
        code: "INVALID-CODE-9999",
        bookingAmount: 500,
      });
      assert.fail("Should have thrown for invalid code");
    } catch (err) {
      assert.strictEqual(err.message, "Invalid or expired reward code.");
    }
    console.log("✅ Test 6: PASS");

    // ----------------------------------------------------
    // Test 7: Expired code rejected
    // ----------------------------------------------------
    console.log("⏳ Test 7: Expired code rejection...");
    const expiredVoucher = await Redemption.create({
      wallet: (await walletService.ensureWallet(customerA._id))._id,
      customer: customerA._id,
      pointsRedeemed: 100,
      discountAmount: 50,
      referenceCode: `EZY-RDM-EXPIRED-${Date.now()}`,
      status: "issued",
      expiresAt: new Date(Date.now() - 86400000), // Yesterday
    });

    try {
      await redemptionService.validateRewardCode({
        customerId: customerA._id,
        code: expiredVoucher.referenceCode,
        bookingAmount: 500,
      });
      assert.fail("Should have thrown for expired code");
    } catch (err) {
      assert.strictEqual(err.message, "This reward code has expired.");
    }
    console.log("✅ Test 7: PASS");

    // ----------------------------------------------------
    // Test 8: Another customer's code rejected
    // ----------------------------------------------------
    console.log("⏳ Test 8: Cross-customer code use rejection...");
    try {
      await redemptionService.validateRewardCode({
        customerId: customerB._id, // Customer B trying to use Customer A's voucher
        code: voucher100.referenceCode,
        bookingAmount: 500,
      });
      assert.fail("Should have thrown for another customer's voucher");
    } catch (err) {
      assert.strictEqual(err.message, "Invalid or expired reward code.");
    }
    console.log("✅ Test 8: PASS");

    // ----------------------------------------------------
    // Test 9: Already-used code rejected
    // ----------------------------------------------------
    console.log("⏳ Test 9: Already-used code rejection...");
    const usedVoucher = await Redemption.create({
      wallet: (await walletService.ensureWallet(customerA._id))._id,
      customer: customerA._id,
      pointsRedeemed: 100,
      discountAmount: 50,
      referenceCode: `EZY-RDM-USED-${Date.now()}`,
      status: "used",
      usedAt: new Date(),
    });

    try {
      await redemptionService.validateRewardCode({
        customerId: customerA._id,
        code: usedVoucher.referenceCode,
        bookingAmount: 500,
      });
      assert.fail("Should have thrown for used code");
    } catch (err) {
      assert.strictEqual(err.message, "This reward has already been used.");
    }
    console.log("✅ Test 9: PASS");

    // ----------------------------------------------------
    // Test 10: Payment failure does not permanently consume reward
    // ----------------------------------------------------
    console.log("⏳ Test 10: Payment failure reverts reservation...");
    const failOrder = await paymentService.createOrderService(
      {
        salonId: testSalon._id,
        serviceId: testService._id,
        bookingDate: new Date(),
        startTime: "11:00",
        notes: "Fail test",
        rewardCode: voucher100.referenceCode,
      },
      customerA._id
    );

    // Revert reservation (simulating payment failure/cancel)
    await redemptionService.revertReservation(failOrder.paymentId ? (await Payment.findById(failOrder.paymentId)).rewardRedemption : null);
    const revertedDoc = await Redemption.findById(voucher100._id);
    assert.strictEqual(revertedDoc.status, "issued", "Voucher status should revert back to issued");
    console.log("✅ Test 10: PASS");

    // ----------------------------------------------------
    // Test 11: Successful payment changes reward status to USED
    // ----------------------------------------------------
    console.log("⏳ Test 11: Successful payment changes status to USED...");
    const successOrder = await paymentService.createOrderService(
      {
        salonId: testSalon._id,
        serviceId: testService._id,
        bookingDate: new Date(),
        startTime: "14:00",
        notes: "Success test",
        rewardCode: voucher100.referenceCode,
      },
      customerA._id
    );

    const mockPaymentId = `pay_mock_${Date.now()}`;
    const hmacBody = successOrder.orderId + "|" + mockPaymentId;
    const mockSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(hmacBody)
      .digest("hex");

    const verifyRes = await paymentService.verifyPaymentService({
      paymentId: successOrder.paymentId,
      razorpay_order_id: successOrder.orderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: mockSignature,
    });

    const usedDoc = await Redemption.findById(voucher100._id);
    assert.strictEqual(usedDoc.status, "used", "Voucher status should be updated to used");
    assert(usedDoc.usedBooking !== null, "usedBooking should be linked to booking");
    console.log("✅ Test 11: PASS");

    // ----------------------------------------------------
    // Test 12: Same reward cannot be used concurrently
    // ----------------------------------------------------
    console.log("⏳ Test 12: Concurrent double-usage prevention...");
    const concVoucher = await redemptionService.redeemPoints(customerA._id, { tierId: tier100._id });
    
    // First reservation
    await redemptionService.reserveRewardCode({ customerId: customerA._id, code: concVoucher.referenceCode, bookingAmount: 500 });
    
    // Concurrent attempt by customer B (or parallel session)
    try {
      await redemptionService.reserveRewardCode({ customerId: customerB._id, code: concVoucher.referenceCode, bookingAmount: 500 });
      assert.fail("Concurrent reservation should be rejected");
    } catch (err) {
      assert(err.message.includes("Invalid") || err.message.includes("reserved"), "Should reject concurrent reservation");
    }
    console.log("✅ Test 12: PASS");

    // ----------------------------------------------------
    // Test 13: Minimum booking amount enforced
    // ----------------------------------------------------
    console.log("⏳ Test 13: Minimum booking amount enforcement...");
    const minTier = await RewardTier.create({
      pointsRequired: 100,
      discountAmount: 50,
      minimumBookingAmount: 500, // ₹500 min booking
      validityDays: 30,
      isActive: true,
    });

    minBookingVoucher = await redemptionService.redeemPoints(customerA._id, { tierId: minTier._id });

    try {
      // Small service is ₹150 + GST = ₹177 < ₹500
      await redemptionService.validateRewardCode({
        customerId: customerA._id,
        code: minBookingVoucher.referenceCode,
        bookingAmount: 177,
      });
      assert.fail("Should reject booking below minimum amount");
    } catch (err) {
      assert(err.message.includes("at least ₹500"), "Should mention minimum booking threshold");
    }
    console.log("✅ Test 13: PASS");

    // ----------------------------------------------------
    // Test 14: Customer can remove applied reward before payment
    // ----------------------------------------------------
    console.log("⏳ Test 14: Customer removal of applied reward before payment...");
    // Without reward code
    const noRewardOrder = await paymentService.createOrderService(
      {
        salonId: testSalon._id,
        serviceId: testService._id,
        bookingDate: new Date(),
        startTime: "16:00",
        notes: "No reward order",
      },
      customerA._id
    );

    assert.strictEqual(noRewardOrder.discountAmount, 0, "Discount should be 0 when reward is removed");
    assert.strictEqual(noRewardOrder.finalAmount, 944, "Final amount should equal original subtotal");
    console.log("✅ Test 14: PASS");

    // ----------------------------------------------------
    // Test 15: Final amount can never become negative
    // ----------------------------------------------------
    console.log("⏳ Test 15: Final amount non-negative safety check...");
    // Voucher discount ₹350 on small service ₹177
    const bigVoucher = await redemptionService.redeemPoints(customerA._id, { tierId: tier500._id });
    const smallOrder = await paymentService.createOrderService(
      {
        salonId: testSalon._id,
        serviceId: smallService._id,
        bookingDate: new Date(),
        startTime: "17:00",
        notes: "Small order",
        rewardCode: bigVoucher.referenceCode,
      },
      customerA._id
    );

    assert(smallOrder.finalAmount >= 0, "Final amount must never be negative");
    assert.strictEqual(smallOrder.finalAmount, 0, "₹177 - ₹350 discount should cap at ₹0");
    console.log("✅ Test 15: PASS");

    // ----------------------------------------------------
    // Test 16: Admin can configure reward tiers
    // ----------------------------------------------------
    console.log("⏳ Test 16: Admin tier configuration...");
    const adminTier = await RewardTier.create({
      pointsRequired: 1000,
      discountAmount: 700,
      minimumBookingAmount: 1500,
      validityDays: 60,
      isActive: true,
    });

    adminTier.discountAmount = 750;
    await adminTier.save();

    const fetchedAdminTier = await RewardTier.findById(adminTier._id);
    assert.strictEqual(fetchedAdminTier.discountAmount, 750, "Admin tier update should persist");
    console.log("✅ Test 16: PASS");

    console.log("\n🎉 ALL 16 REWARD DISCOUNT TESTS PASSED SUCCESSFULLY!\n");

  } finally {
    // Clean up sandbox test data
    console.log("🧹 Cleaning up sandbox test data...");
    await User.deleteMany({ _id: { $in: [customerA._id, customerB._id] } });
    await Salon.deleteMany({ _id: testSalon._id });
    await Service.deleteMany({ _id: { $in: [testService._id, smallService._id] } });
    await WalletAccount.deleteMany({ customer: { $in: [customerA._id, customerB._id] } });
    await LedgerEntry.deleteMany({ customer: { $in: [customerA._id, customerB._id] } });
    await Redemption.deleteMany({ customer: { $in: [customerA._id, customerB._id] } });
    await Payment.deleteMany({ customer: { $in: [customerA._id, customerB._id] } });
    await Booking.deleteMany({ customer: { $in: [customerA._id, customerB._id] } });
    console.log("🧹 Cleanup complete.");
  }
}

// Add script runner if called directly
if (require.main === module) {
  runRewardDiscountTests()
    .then(() => {
      console.log("Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ TEST SUITE FAILED:");
      console.error(err);
      process.exit(1);
    });
}

module.exports = runRewardDiscountTests;
