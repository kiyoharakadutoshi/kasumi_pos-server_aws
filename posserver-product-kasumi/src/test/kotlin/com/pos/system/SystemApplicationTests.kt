package com.pos.system

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest


@SpringBootTest
class SystemApplicationTests {

	@Test
	fun contextLoads() {
	}

//	@Test
//	@Throws(Exception::class)
//	fun testPdfJson2Valid() {
//		val jsonPart = MockPart("someJson", "test.json",
//				testValidJson.getInputStream().readAllBytes())
//		// we need this! (so implicitely validate, but other error code)
//		jsonPart.headers.contentType = MediaType.APPLICATION_JSON
//		mockMvc.perform(putMultipart("/validated/pdf/json/v2")
//				.file(mockPdf)
//				.part(jsonPart)) // !
//				.andExpectAll(status().isOk(),  // !!
//						content().string("aha.pdf"))
//	}
}
