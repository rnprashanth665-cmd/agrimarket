import unittest

from auth import hash_password, verify_password


class LegacyPasswordVerificationTests(unittest.TestCase):
    def test_legacy_plaintext_passwords_are_accepted(self):
        self.assertTrue(verify_password('password123', 'password123'))

    def test_bcrypt_hashed_passwords_still_work(self):
        hashed = hash_password('secret123')
        self.assertTrue(verify_password('secret123', hashed))


if __name__ == '__main__':
    unittest.main()
