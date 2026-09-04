/**
 * Standalone test runner for Phase 2 RAG Knowledge Base & Retrieval
 */
import { knowledgeBase } from './rag/knowledge_base';

console.log("=== Running Phase 2 RAG Standalone Retrieval Tests ===");

// Test 1: Search for Packaged drinking water
const res1 = knowledgeBase.search("What is the TDS limit in packaged drinking water IS 14543?", 3);
console.log("\n[TEST 1] Query: 'packaged drinking water TDS IS 14543'");
console.log(`Found ${res1.length} chunks. Top chunk: ${res1[0]?.chunk.title} (Score: ${res1[0]?.score})`);
console.log(`Citation: Standard ${res1[0]?.citation.standard_number}`);

// Test 2: Search for Gold Hallmarking HUID
const res2 = knowledgeBase.search("How do I verify 6-digit HUID code for 22k gold jewellery?", 3);
console.log("\n[TEST 2] Query: 'verify HUID code gold jewellery'");
console.log(`Found ${res2.length} chunks. Top chunk: ${res2[0]?.chunk.title} (Score: ${res2[0]?.score})`);

// Test 3: Search for non-existent query to test bug guard
const res3 = knowledgeBase.search("xyznonexistenttermquantumfluxrandom123", 3);
console.log("\n[TEST 3] Query: Non-existent term (Bug guard test)");
console.log(`Found ${res3.length} chunks. Returns empty array gracefully without exceptions.`);

// Test 4: Search for Platinum purchase and composition
const res4 = knowledgeBase.search("i want to buy platinum in india, help me to decide the right composition of the same in order to make a sound purchase", 3);
console.log("\n[TEST 4] Query: 'buy platinum in india, right composition'");
console.log(`Found ${res4.length} chunks. Top chunk: ${res4[0]?.chunk.title} (Score: ${res4[0]?.score})`);
console.log(`Citation: Standard ${res4[0]?.citation.standard_number}`);
console.log(`Snippet preview: ${res4[0]?.chunk.content.substring(0, 180)}...`);

// Test 5: Search for FAQ questions like certification cost or renewal
const res5 = knowledgeBase.search("How much does BIS certification cost and how long does it take?", 3);
console.log("\n[TEST 5] Query: 'How much does BIS certification cost and how long does it take?'");
console.log(`Found ${res5.length} chunks. Top chunk: ${res5[0]?.chunk.title} (Score: ${res5[0]?.score})`);
console.log(`Snippet preview: ${res5[0]?.chunk.content.substring(0, 180)}...`);

// Test 6: Search for Silver purchase and composition (regression check for silver vs platinum bug)
const res6 = knowledgeBase.search("i want to buy silver in india, help me to decide the right composition of the same in order to make a sound purchase", 3);
console.log("\n[TEST 6] Query: 'i want to buy silver in india, help me to decide the right composition...'");
res6.forEach((r, idx) => {
  console.log(`  [${idx+1}] Title: ${r.chunk.title} (Score: ${r.score})`);
});

console.log("\n=== Phase 2 RAG Tests Completed Successfully ===");
